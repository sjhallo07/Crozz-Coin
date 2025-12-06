# zkLogin Implementation for CROZZ ECOSYSTEM

## Overview

zkLogin is a Sui primitive enabling streamlined, self-custodial transactions using OAuth credentials (Google, Facebook, Twitch, Apple, etc.) with zero-knowledge proofs. This implementation for CROZZ ECOSYSTEM provides:

- **Cryptographic Security** - RSA signatures verified on-chain
- **Privacy Protection** - Zero-knowledge proofs hide OAuth identifiers
- **2FA Authentication** - Requires both OAuth credential and user salt
- **Multi-Provider Support** - Google, Facebook, Twitch, Apple, and more

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CROZZ ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                   Frontend (React)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ZkLoginAuth Component                              │   │
│  │  - OAuth authorization                              │   │
│  │  - JWT handling                                      │   │
│  │  - Session management                               │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Services                                  │
│  ┌─────────────────┬──────────────────┬─────────────────┐  │
│  │  zkLoginClient  │ zkLoginProvider  │  Other Services │  │
│  │  - Auth flow    │  - Config        │                 │  │
│  │  - Signing      │  - Constants     │                 │  │
│  └─────────────────┴──────────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│              External Services                              │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │ OAuth        │ Salt Service │ ZK Proving Service   │   │
│  │ Provider     │              │                      │   │
│  │ (Google,     │ Generates    │ Generates ZK proof   │   │
│  │ Facebook,    │ user_salt    │ from JWT + salt      │   │
│  │ etc)         │              │                      │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Sui Blockchain                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Verify: ephemeral signature + ZK proof             │   │
│  │ Derive address from: iss + aud + sub + user_salt   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Supported OAuth Providers

### Production Ready (All Networks)
- **Google** - https://accounts.google.com
- **Facebook** - https://www.facebook.com
- **Twitch** - https://id.twitch.tv
- **Apple** - https://appleid.apple.com
- **AWS (Tenant)** - https://aws-tenant.auth
- **Karrier One** - https://karrier.one
- **Credenza3** - https://credenza3.io

### Testnet/Devnet Only
- **Microsoft** - https://login.microsoftonline.com
- **Slack** - https://slack.com
- **Kakao** - https://kauth.kakao.com
- **GitHub** - https://github.com/login/oauth

### Under Review
- **Amazon** - Implementation in progress
- **WeChat** - Implementation in progress
- **Auth0** - Implementation in progress
- **Okta** - Implementation in progress

## How zkLogin Works

### Step-by-Step Flow

```
1. User initiates login
   ↓
2. Generate ephemeral key pair (eph_sk, eph_pk)
   ↓
3. Create nonce = Hash(eph_pk || max_epoch || jwt_randomness)
   ↓
4. Redirect to OAuth provider with nonce
   ↓
5. User authenticates and grants access
   ↓
6. OAuth provider returns JWT with nonce
   ↓
7. Request user_salt from Salt Service
   ↓
8. Request ZK proof from Proving Service
   Proof verifies:
   - ✓ RSA signature from provider
   - ✓ Nonce contains correct ephemeral key
   - ✓ Key claim matches JWT field
   - ✓ Address consistent with salt
   ↓
9. Derive zkLogin address from:
   Address = Blake2b(flag=0x05 || iss || addr_seed)
   addr_seed = Poseidon(kc_name || kc_value || aud || Poseidon(salt))
   ↓
10. Sign transaction with ephemeral key
    ↓
11. Submit to Sui with:
    - Ephemeral signature
    - ZK proof
    - Public inputs (iss, aud, kid)
    ↓
12. Sui validators verify:
    - ✓ Ephemeral signature valid
    - ✓ ZK proof valid
    - ✓ JWK matches provider
    ↓
13. ✓ Transaction executed
```

## Key Components

### 1. zkLoginProvider.ts

Configuration and constants for zkLogin protocol:

```typescript
import {
  OAuthProvider,
  ZKLOGIN_PROVIDERS,      // Provider configs
  ZKLOGIN_CRYPTO_CONFIG,  // Groth16 parameters
  ZKLOGIN_SECURITY_CONFIG // Security settings
} from './zkloginProvider';
```

**Exports:**
- `OAuthProvider` enum - Supported providers
- `ZKLOGIN_PROVIDERS` - Configuration per provider
- `ZKLOGIN_CRYPTO_CONFIG` - Cryptographic parameters
- `ZKLOGIN_SECURITY_CONFIG` - Security constraints
- `generateZkLoginNonce()` - Create nonce from components

### 2. zkLoginClient.ts

Main client for handling OAuth and zkLogin flows:

```typescript
import ZkLoginClient from './zkloginClient';

// Initialize client
const client = new ZkLoginClient(
  OAuthProvider.GOOGLE,
  'your-client-id.apps.googleusercontent.com',
  'https://yourapp.com/callback',
  'testnet'
);

// Generate authorization URL
const authUrl = client.generateAuthorizationUrl();

// Handle callback and authenticate
const { address, session } = await client.authenticate(
  callbackUrl,
  'https://salt-service.example.com',
  'https://proving-service.example.com'
);
```

**Key Methods:**
- `generateAuthorizationUrl()` - Get OAuth login URL
- `handleCallback()` - Process OAuth redirect
- `requestUserSalt()` - Get unique salt per user
- `requestZkProof()` - Generate ZK proof
- `deriveZkLoginAddress()` - Compute on-chain address
- `authenticate()` - Complete auth flow
- `signTransaction()` - Sign with ephemeral key
- `isSessionValid()` - Check session expiry
- `refreshSession()` - Generate new ephemeral key

### 3. ZkLoginAuth Component

React component for zkLogin authentication UI:

```typescript
import { ZkLoginAuth } from './components/ZkLoginAuth';

<ZkLoginAuth
  provider={OAuthProvider.GOOGLE}
  clientId="your-client-id.apps.googleusercontent.com"
  redirectUri="https://yourapp.com/callback"
  saltServiceUrl="https://salt-service.example.com"
  provingServiceUrl="https://proving-service.example.com"
  network="testnet"
  onAuthSuccess={(address, session) => {
    console.log('User authenticated:', address);
  }}
  onAuthError={(error) => {
    console.error('Auth failed:', error);
  }}
/>
```

## Security Model

### 2FA Authentication

zkLogin is a two-factor authentication system:

**Factor 1: OAuth Credential**
- Controlled by user
- Managed by OAuth provider
- Recoverable via password reset
- Required for every login

**Factor 2: User Salt**
- Unique per user per relying party
- Unlinks OAuth ID from on-chain address
- Can be user-managed or service-managed
- Critical for account recovery

### Threat Model

| Threat | Impact | Mitigation |
|--------|--------|-----------|
| OAuth account compromised | Medium | Salt not compromised ← Additional layer |
| Salt compromised | Medium | OAuth not compromised ← Additional layer |
| Both compromised | Critical | Complete account loss |
| Ephemeral key exposed | Low | Can refresh after logout |
| ZK proof exposed | None | Requires valid ephemeral signature |

### Privacy Guarantees

✓ **No Public Linking** - OAuth identifier not on-chain  
✓ **Zero-Knowledge Proof** - Hides JWT sensitive fields  
✓ **Ephemeral Signatures** - No persistent key management  
✓ **Public Input Hash** - Reveals only iss, aud, kid  
✓ **Optional Verification** - Can verify identity on-chain  

## Usage Examples

### Example 1: Basic Authentication

```typescript
const client = new ZkLoginClient(
  OAuthProvider.GOOGLE,
  process.env.GOOGLE_CLIENT_ID!,
  'http://localhost:5173/callback',
  'testnet'
);

// Step 1: Get authorization URL
const authUrl = client.generateAuthorizationUrl();
// Redirect user: window.location.href = authUrl;

// Step 2: Handle callback (in /callback route)
const { address, session } = await client.authenticate(
  window.location.href,
  'https://your-salt-service.com',
  'https://your-proving-service.com'
);

console.log('User address:', address);
// Store session securely for future transactions
```

### Example 2: Multi-Provider Support

```typescript
// Support Google and Facebook
const providers = [
  OAuthProvider.GOOGLE,
  OAuthProvider.FACEBOOK,
];

providers.forEach(provider => {
  const client = new ZkLoginClient(
    provider,
    process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
    'http://localhost:5173/callback',
    'testnet'
  );
  
  const config = ZKLOGIN_PROVIDERS[provider];
  console.log(`${provider} supports:`, config.supportedNetworks);
});
```

### Example 3: Transaction Signing

```typescript
const session = client.getSession(sessionId);
if (!session) throw new Error('Session not found');

// Create transaction data
const txData = Buffer.from(/* transaction bytes */);

// Sign with ephemeral private key
const ephemeralSignature = client.signTransaction(sessionId, txData);

// Submit to Sui with ZK proof
const response = await suiClient.executeTransaction({
  signature: ephemeralSignature,
  proof: session.proof,
  publicInputs: {
    issuer: session.jwt.payload.iss,
    clientId: session.jwt.payload.aud,
    kid: session.jwt.header.kid,
  },
});
```

### Example 4: Session Management

```typescript
// Get all active sessions
const activeSessions = client.getActiveSessions();

// Check if session is valid
if (client.isSessionValid(sessionId)) {
  // Can use session
}

// Refresh ephemeral key
const updated = await client.refreshSession(sessionId);

// Revoke session
client.revokeSession(sessionId);
```

## Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web application)
3. Add redirect URI: `https://yourapp.com/callback`
4. Set `GOOGLE_CLIENT_ID` environment variable

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app and configure OAuth settings
3. Add redirect URI: `https://yourapp.com/callback`
4. Set `FACEBOOK_CLIENT_ID` environment variable

### Custom Salt Service

If using a custom salt service, it should:

1. Accept JWT with iss, aud, sub
2. Return unique salt per (iss, aud, sub)
3. Implement proper access controls
4. Optionally include 2FA for salt retrieval

```typescript
// Example salt service endpoint
POST /salt
{
  "issuer": "https://accounts.google.com",
  "clientId": "your-client-id.apps.googleusercontent.com",
  "subjectId": "1234567890"
}

Response:
{
  "salt": "0x1234567890abcdef..."
}
```

### Custom Proving Service

If using a custom proving service, it should:

1. Accept JWT, salt, ephemeral key, max epoch
2. Generate valid Groth16 ZK proof
3. Return proof and public input hash

```typescript
// Example proving service endpoint
POST /prove
{
  "jwt": "eyJhbGc...",
  "userSalt": "0x1234...",
  "ephemeralPublicKey": "0xabcd...",
  "maxEpoch": 1000,
  "keyClaimName": "sub"
}

Response:
{
  "proof": "0xproof_bytes...",
  "publicInputHash": "0xhash..."
}
```

## Best Practices

1. **Secure Ephemeral Key Storage**
   - Store in sessionStorage or secure cookie
   - Never log or expose in console
   - Clear on logout

2. **Session Management**
   - Check session validity before transactions
   - Refresh before expiry
   - Revoke on logout

3. **Error Handling**
   - Gracefully handle provider errors
   - Provide user-friendly error messages
   - Log errors for debugging

4. **Multi-Signature with zkLogin**
   - Use Sui native Multisig
   - Combine zkLogin with traditional keys
   - Example: 2-of-2 Multisig (Google zkLogin + Facebook zkLogin)

5. **Account Recovery**
   - Use multiple OAuth providers
   - Multisig with backup signer
   - Clear recovery instructions

## Testing

```typescript
// Mock zkLogin client for testing
const mockClient = {
  generateAuthorizationUrl: jest.fn(() => 'https://example.com/auth'),
  handleCallback: jest.fn(),
  authenticate: jest.fn(async () => ({
    address: '0x1234567890abcdef',
    session: { /* mock session */ }
  })),
};
```

## Related Documentation

- [Sui zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)
- [Sui GraphQL API](https://docs.sui.io/references/sui-api/sui-graphql)
- [Sui Multisig Guide](https://sdk.mystenlabs.com/typescript/cryptography/multisig)
- [Sui CLI - zkLogin Verification](https://docs.sui.io/references/cli/keytool)

## Resources

**Official**
- Sui zkLogin Docs: https://docs.sui.io/concepts/cryptography/zklogin
- zkLogin Ceremony: https://github.com/sui-foundation/zklogin-ceremony-contributions
- Security Audits: https://github.com/sui-foundation/security-audits

**External**
- OpenID Connect Spec: https://openid.net/connect/
- Groth16 zkSNARK: https://eprint.iacr.org/2016/260.pdf
- MMORPG Protocol: https://eprint.iacr.org/2017/1050.pdf

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** December 6, 2025
