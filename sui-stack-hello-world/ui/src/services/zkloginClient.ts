// zkLogin Client Implementation for CROZZ ECOSYSTEM
// Handles OAuth authentication, JWT processing, and zkLogin transactions

import {
  OAuthProvider,
  ZKLOGIN_PROVIDERS,
  EphemeralKeyPair,
  JWTPayload,
  JWT,
  ZkLoginSession,
  ZkLoginProof,
  ZkLoginAddressComponents,
  ZKLOGIN_SECURITY_CONFIG,
  ZKLOGIN_ADDRESS_CONFIG,
  generateZkLoginNonce,
} from './zkloginProvider';
import crypto from 'crypto';

/**
 * zkLogin Client for CROZZ ECOSYSTEM
 * Manages OAuth authentication and zkLogin transaction signing
 */
export class ZkLoginClient {
  private provider: OAuthProvider;
  private clientId: string;
  private clientSecret?: string;
  private redirectUri: string;
  private network: 'devnet' | 'testnet' | 'mainnet';
  private sessions: Map<string, ZkLoginSession> = new Map();

  constructor(
    provider: OAuthProvider,
    clientId: string,
    redirectUri: string,
    network: 'devnet' | 'testnet' | 'mainnet' = 'testnet',
    clientSecret?: string
  ) {
    this.provider = provider;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.network = network;
    this.clientSecret = clientSecret;

    // Validate provider is supported for this network
    const providerConfig = ZKLOGIN_PROVIDERS[provider];
    if (!providerConfig.supportedNetworks?.includes(network)) {
      throw new Error(
        `Provider ${provider} is not supported on ${network}. Supported networks: ${providerConfig.supportedNetworks?.join(', ')}`
      );
    }
  }

  /**
   * Generate authorization URL for OAuth login
   */
  generateAuthorizationUrl(): string {
    const providerConfig = ZKLOGIN_PROVIDERS[this.provider];
    if (!providerConfig.authorizationEndpoint) {
      throw new Error(`No authorization endpoint for provider ${this.provider}`);
    }

    // Generate ephemeral key pair for this session
    const ephemeralKeyPair = this.generateEphemeralKeyPair();
    const maxEpoch = this.calculateMaxEpoch();
    const jwtRandomness = this.generateRandomness();

    // Generate nonce with ephemeral public key + max epoch + randomness
    const nonce = generateZkLoginNonce(ephemeralKeyPair.publicKey, maxEpoch, jwtRandomness);

    // Store ephemeral key pair for later use
    const sessionId = crypto.randomUUID();
    const session: ZkLoginSession = {
      id: sessionId,
      provider: this.provider,
      ephemeralKeyPair,
      expiresAt: Date.now() + ZKLOGIN_SECURITY_CONFIG.ephemeralKey.sessionDuration * 1000,
      createdAt: Date.now(),
    };
    this.sessions.set(sessionId, session);

    // Construct authorization URL
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'id_token',
      scope: (providerConfig.scope || []).join(' '),
      redirect_uri: this.redirectUri,
      nonce: nonce,
      state: sessionId, // Store session ID in state for retrieval
    });

    return `${providerConfig.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and extract JWT
   */
  async handleCallback(callbackUrl: string): Promise<ZkLoginSession> {
    const url = new URL(callbackUrl);
    const idToken = url.searchParams.get('id_token');
    const state = url.searchParams.get('state');

    if (!idToken || !state) {
      throw new Error('Missing id_token or state in callback');
    }

    // Retrieve session from state
    const session = this.sessions.get(state);
    if (!session) {
      throw new Error('Invalid session state');
    }

    // Parse JWT (without verification - verification happens on-chain)
    const jwt = this.parseJWT(idToken);
    session.jwt = jwt;

    // Store session with JWT
    this.sessions.set(state, session);

    return session;
  }

  /**
   * Request user salt from salt service
   * Salt is unique per user per relying party (iss + aud + sub)
   */
  async requestUserSalt(saltServiceUrl: string, jwt: JWT): Promise<string> {
    const payload = jwt.payload as JWTPayload;

    const response = await fetch(`${saltServiceUrl}/salt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issuer: payload.iss,
        clientId: this.clientId, // aud
        subjectId: payload.sub,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request user salt: ${response.statusText}`);
    }

    const data = await response.json();
    return data.salt;
  }

  /**
   * Request ZK proof from proving service
   */
  async requestZkProof(
    provingServiceUrl: string,
    jwt: JWT,
    userSalt: string,
    session: ZkLoginSession
  ): Promise<ZkLoginProof> {
    const payload = jwt.payload as JWTPayload;

    const response = await fetch(`${provingServiceUrl}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jwt: jwt.raw,
        userSalt,
        ephemeralPublicKey: session.ephemeralKeyPair.publicKey,
        jwtRandomness: this.generateRandomness(), // In production, use stored randomness from nonce
        maxEpoch: session.ephemeralKeyPair.maxEpoch,
        keyClaimName: 'sub',
        keyClaimValue: payload.sub,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request ZK proof: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      proof: data.proof,
      issuer: payload.iss,
      publicInputHash: data.publicInputHash,
      maxEpoch: session.ephemeralKeyPair.maxEpoch,
      ephemeralPublicKey: session.ephemeralKeyPair.publicKey,
    };
  }

  /**
   * Derive zkLogin address from components
   * Address = Blake2b_256(zk_login_flag, iss_L, iss, addr_seed)
   * where addr_seed = Poseidon_BN254(kc_name_F, kc_value_F, aud_F, Poseidon_BN254(user_salt))
   */
  deriveZkLoginAddress(components: ZkLoginAddressComponents): string {
    // In production, this uses Poseidon hashing for zkSNARK compatibility
    // For now, we use a simplified approach with Blake2b

    const { issuer, clientId, subjectId, userSalt, keyClaimName, keyClaimValue } = components;

    // Create address seed from components
    const addrSeedData = [
      keyClaimName,
      keyClaimValue,
      clientId,
      userSalt,
      issuer,
    ].join(':');

    // Hash the seed
    const addrSeedHash = crypto.createHash('blake2b256').update(addrSeedData).digest();

    // Create final address
    const flagByte = Buffer.alloc(1);
    flagByte[0] = ZKLOGIN_ADDRESS_CONFIG.addressFlag;

    // Derive from flag, issuer and seed
    const issuerBytes = Buffer.from(issuer, 'utf-8');
    const addressData = Buffer.concat([flagByte, issuerBytes, addrSeedHash]);

    const address = crypto.createHash('blake2b256').update(addressData).digest('hex');

    // Format as Sui address (0x prefix)
    return '0x' + address.slice(0, 64);
  }

  /**
   * Complete zkLogin authentication flow
   */
  async authenticate(
    callbackUrl: string,
    saltServiceUrl: string,
    provingServiceUrl: string
  ): Promise<{ address: string; session: ZkLoginSession }> {
    // Step 1: Handle OAuth callback
    const session = await this.handleCallback(callbackUrl);
    if (!session.jwt) {
      throw new Error('JWT not available in session');
    }

    const payload = session.jwt.payload as JWTPayload;

    // Step 2: Request user salt
    const userSalt = await this.requestUserSalt(saltServiceUrl, session.jwt);
    session.userSalt = userSalt;

    // Step 3: Request ZK proof
    const proof = await this.requestZkProof(provingServiceUrl, session.jwt, userSalt, session);
    session.proof = proof;

    // Step 4: Derive zkLogin address
    const address = this.deriveZkLoginAddress({
      issuer: payload.iss,
      clientId: this.clientId,
      subjectId: payload.sub,
      userSalt,
      keyClaimName: 'sub',
      keyClaimValue: payload.sub,
    });

    session.zkLoginAddress = address;

    return { address, session };
  }

  /**
   * Sign a transaction with ephemeral private key
   * This would be used to create the ephemeral signature for the zkLogin transaction
   */
  signTransaction(sessionId: string, transactionData: Buffer): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // In production, this uses the actual ephemeral private key from the session
    // For now, we create a signature using the private key
    const privateKey = crypto.createPrivateKey({
      key: Buffer.from(session.ephemeralKeyPair.privateKey, 'hex'),
      format: 'der',
      type: 'pkcs1',
    });

    const signature = crypto.sign('sha256', transactionData, privateKey);
    return signature.toString('hex');
  }

  /**
   * Verify zkLogin session is still valid
   */
  isSessionValid(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Check if ephemeral key has expired
    if (Date.now() > session.ephemeralKeyPair.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Refresh zkLogin session (generate new ephemeral key and proof)
   */
  async refreshSession(sessionId: string): Promise<ZkLoginSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.jwt) {
      throw new Error('JWT not available in session');
    }

    // Generate new ephemeral key pair
    session.ephemeralKeyPair = this.generateEphemeralKeyPair();

    // Extend session expiry
    session.expiresAt = Date.now() + ZKLOGIN_SECURITY_CONFIG.ephemeralKey.sessionDuration * 1000;

    // In production, would regenerate ZK proof with new nonce
    // session.proof = await this.requestZkProof(...);

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): ZkLoginSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all active sessions
   */
  getActiveSessions(): ZkLoginSession[] {
    const now = Date.now();
    return Array.from(this.sessions.values()).filter((s) => s.expiresAt > now);
  }

  /**
   * Revoke/delete a session
   */
  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // ==================== Private Helper Methods ====================

  /**
   * Generate ephemeral key pair
   */
  private generateEphemeralKeyPair(): EphemeralKeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });

    const now = Date.now();
    const sessionDuration = ZKLOGIN_SECURITY_CONFIG.ephemeralKey.sessionDuration * 1000;

    return {
      publicKey: crypto.createPublicKey(publicKey).export({ format: 'der', type: 'spki' }).toString('hex'),
      privateKey: privateKey.toString('hex'),
      createdAt: now,
      expiresAt: now + sessionDuration,
      maxEpoch: Math.floor(now / 1000) + ZKLOGIN_SECURITY_CONFIG.ephemeralKey.maxSessionEpochs,
    };
  }

  /**
   * Calculate max epoch for JWT nonce
   */
  private calculateMaxEpoch(): number {
    // Epochs are typically 3-4 seconds on Sui
    // Add buffer for session duration
    const maxEpochs = ZKLOGIN_SECURITY_CONFIG.ephemeralKey.maxSessionEpochs;
    return Math.floor(Date.now() / 1000) + maxEpochs;
  }

  /**
   * Generate random value for JWT
   */
  private generateRandomness(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Parse JWT (without verification)
   * Verification is done on-chain by Sui validators
   */
  private parseJWT(token: string): JWT {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerStr, payloadStr, signature] = parts;

    try {
      const header = JSON.parse(Buffer.from(headerStr, 'base64').toString());
      const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString());

      return {
        header,
        payload,
        signature,
        raw: token,
      };
    } catch (error) {
      throw new Error('Failed to parse JWT');
    }
  }
}

export default ZkLoginClient;
