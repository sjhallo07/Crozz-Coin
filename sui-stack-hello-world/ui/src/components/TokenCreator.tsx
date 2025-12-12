import React, { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@radix-ui/themes';
import { Copy, AlertCircle, CheckCircle } from 'lucide-react';
import './TokenCreator.css';

interface TokenFormData {
  // General
  blockchain: string;
  tokenName: string;
  tokenSymbol: string;
  moduleName: string;
  decimals: number;
  initialSupply: number;

  // Addresses
  supplyRecipient: string;
  treasuryCapHolder: string;
  differentRecipient: boolean;
  differentTreasuryHolder: boolean;

  // Features
  isMintable: boolean;
  isFreezable: boolean;
  isPausable: boolean;

  // Metadata
  tokenLogo: string;
  tokenDescription: string;
  isImmutableMetadata: boolean;
}

const SUPPORTED_NETWORKS = ['Devnet', 'Testnet', 'Mainnet'];
const MAX_DECIMALS = 9;
const MAX_SUPPLY_BY_DECIMALS: Record<number, bigint> = {
  0: BigInt('18400000000000000000'),
  1: BigInt('1840000000000000000'),
  2: BigInt('184000000000000000'),
  3: BigInt('18400000000000000'),
  4: BigInt('1840000000000000'),
  5: BigInt('184000000000000'),
  6: BigInt('18400000000000'),
  7: BigInt('1840000000000'),
  8: BigInt('184000000000'),
  9: BigInt('18400000000'),
};

export const TokenCreator: React.FC = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'optional' | 'metadata'>('general');
  const [formData, setFormData] = useState<TokenFormData>({
    blockchain: 'Devnet',
    tokenName: '',
    tokenSymbol: '',
    moduleName: '',
    decimals: 6,
    initialSupply: 1000000,
    supplyRecipient: '',
    treasuryCapHolder: '',
    differentRecipient: false,
    differentTreasuryHolder: false,
    isMintable: true,
    isFreezable: false,
    isPausable: false,
    tokenLogo: '',
    tokenDescription: '',
    isImmutableMetadata: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const generateModuleName = () => {
    const name = formData.tokenName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setFormData(prev => ({
      ...prev,
      moduleName: name || 'token',
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.tokenName.trim()) {
      setMessage({ type: 'error', text: 'Token name is required' });
      return false;
    }
    if (!formData.tokenSymbol.trim()) {
      setMessage({ type: 'error', text: 'Token symbol is required' });
      return false;
    }
    if (!formData.moduleName.trim()) {
      setMessage({ type: 'error', text: 'Module name is required' });
      return false;
    }
    if (formData.decimals < 0 || formData.decimals > MAX_DECIMALS) {
      setMessage({ type: 'error', text: `Decimals must be between 0 and ${MAX_DECIMALS}` });
      return false;
    }
    if (formData.initialSupply <= 0) {
      setMessage({ type: 'error', text: 'Initial supply must be greater than 0' });
      return false;
    }

    const maxSupply = MAX_SUPPLY_BY_DECIMALS[formData.decimals];
    if (BigInt(formData.initialSupply) > maxSupply) {
      setMessage({
        type: 'error',
        text: `Initial supply exceeds maximum for ${formData.decimals} decimals: ${maxSupply.toString()}`,
      });
      return false;
    }

    return true;
  };

  const handleCreateToken = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const tx = new Transaction();

      // Add call to token_creator module
      tx.moveCall({
        target: `0x1::token_creator::create_token`,
        arguments: [
          tx.pure.string(formData.tokenName),
          tx.pure.string(formData.tokenSymbol),
          tx.pure.u8(formData.decimals),
          tx.pure.string(formData.tokenDescription),
          tx.pure.string(formData.tokenLogo),
          tx.pure.string(formData.moduleName),
          tx.pure.u64(formData.initialSupply),
          tx.pure.bool(formData.isMintable),
          tx.pure.bool(formData.isFreezable),
          tx.pure.bool(formData.isPausable),
          tx.pure.address(formData.differentTreasuryHolder ? formData.treasuryCapHolder : formData.supplyRecipient),
          tx.pure.address(formData.differentRecipient ? formData.supplyRecipient : formData.supplyRecipient),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            const txHash = result.digest;
            setCreatedTokenAddress(txHash);
            setMessage({
              type: 'success',
              text: `Token created successfully! Transaction: ${txHash}`,
            });
            // Reset form
            setFormData({
              blockchain: 'Devnet',
              tokenName: '',
              tokenSymbol: '',
              moduleName: '',
              decimals: 6,
              initialSupply: 1000000,
              supplyRecipient: '',
              treasuryCapHolder: '',
              differentRecipient: false,
              differentTreasuryHolder: false,
              isMintable: true,
              isFreezable: false,
              isPausable: false,
              tokenLogo: '',
              tokenDescription: '',
              isImmutableMetadata: false,
            });
          },
          onError: (error) => {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
          },
        }
      );
    } catch (error) {
      setMessage({ type: 'error', text: `Error creating token: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-creator">
      <div className="token-creator-header">
        <h1>🪙 Token Creator</h1>
        <p>Create custom tokens on Sui with advanced features</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? (
            <CheckCircle className="alert-icon" />
          ) : (
            <AlertCircle className="alert-icon" />
          )}
          <div>{message.text}</div>
          <button onClick={() => setMessage(null)} className="alert-close">
            ✕
          </button>
        </div>
      )}

      <div className="token-creator-container">
        {/* Sidebar Navigation */}
        <div className="token-creator-sidebar">
          <div
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General
          </div>
          <div
            className={`tab-button ${activeTab === 'optional' ? 'active' : ''}`}
            onClick={() => setActiveTab('optional')}
          >
            ✨ Optional
          </div>
          <div
            className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            📝 Metadata
          </div>
        </div>

        {/* Main Content */}
        <div className="token-creator-content">
          {activeTab === 'general' && (
            <div className="tab-content">
              <h2>General Configuration</h2>

              {/* Blockchain Selection */}
              <div className="form-section">
                <h3>Blockchain</h3>
                <p className="section-description">Select which Sui blockchain to deploy to</p>
                <div className="form-group">
                  <label htmlFor="blockchain">Network</label>
                  <select
                    id="blockchain"
                    name="blockchain"
                    value={formData.blockchain}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {SUPPORTED_NETWORKS.map(network => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                  <small>Current network: {formData.blockchain}</small>
                </div>
              </div>

              {/* Token Name & Symbol */}
              <div className="form-section">
                <h3>Token Identification</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tokenName">Token Name</label>
                    <input
                      type="text"
                      id="tokenName"
                      name="tokenName"
                      value={formData.tokenName}
                      onChange={handleInputChange}
                      placeholder="e.g., Crozz Coin"
                      className="form-input"
                      maxLength={100}
                    />
                    <small>{formData.tokenName.length}/100 characters</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="tokenSymbol">Token Symbol</label>
                    <input
                      type="text"
                      id="tokenSymbol"
                      name="tokenSymbol"
                      value={formData.tokenSymbol}
                      onChange={handleInputChange}
                      placeholder="e.g., CRZ"
                      className="form-input"
                      maxLength={10}
                    />
                    <small>{formData.tokenSymbol.length}/10 characters</small>
                  </div>
                </div>
              </div>

              {/* Module Name */}
              <div className="form-section">
                <h3>Module Name</h3>
                <p className="section-description">Must start with lowercase letter, only lowercase/numbers/underscores</p>
                <div className="form-group">
                  <label htmlFor="moduleName">Module Name</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="moduleName"
                      name="moduleName"
                      value={formData.moduleName}
                      onChange={handleInputChange}
                      placeholder="e.g., crozz_coin"
                      className="form-input"
                    />
                    <Button onClick={generateModuleName} className="generate-button">
                      Auto-Generate
                    </Button>
                  </div>
                  <small>⚠️ Cannot be changed after deployment</small>
                </div>
              </div>

              {/* Decimals */}
              <div className="form-section">
                <h3>Decimals</h3>
                <p className="section-description">How many decimal places for token fractions (0-9)</p>
                <div className="form-group">
                  <label htmlFor="decimals">Decimal Places</label>
                  <select
                    id="decimals"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {Array.from({ length: MAX_DECIMALS + 1 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 9 ? `${i} decimals (Recommended - like SUI)` : i === 6 ? `${i} decimals (Recommended - Stablecoins)` : `${i} decimals`}
                      </option>
                    ))}
                  </select>
                  <small>Max supply: {MAX_SUPPLY_BY_DECIMALS[formData.decimals].toString()}</small>
                </div>
              </div>

              {/* Initial Supply */}
              <div className="form-section">
                <h3>Initial Supply</h3>
                <p className="section-description">Tokens minted at creation</p>
                <div className="form-group">
                  <label htmlFor="initialSupply">Supply Amount</label>
                  <input
                    type="number"
                    id="initialSupply"
                    name="initialSupply"
                    value={formData.initialSupply}
                    onChange={handleInputChange}
                    min="1"
                    className="form-input"
                  />
                  <small>Max: {MAX_SUPPLY_BY_DECIMALS[formData.decimals].toString()}</small>
                </div>
              </div>

              {/* Supply Recipients */}
              <div className="form-section">
                <h3>Supply & Treasury Management</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="differentRecipient"
                      checked={formData.differentRecipient}
                      onChange={handleInputChange}
                    />
                    Send initial supply to different address
                  </label>
                </div>
                {formData.differentRecipient && (
                  <div className="form-group">
                    <label htmlFor="supplyRecipient">Supply Recipient Address</label>
                    <input
                      type="text"
                      id="supplyRecipient"
                      name="supplyRecipient"
                      value={formData.supplyRecipient}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="form-input"
                    />
                  </div>
                )}

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="differentTreasuryHolder"
                      checked={formData.differentTreasuryHolder}
                      onChange={handleInputChange}
                    />
                    Assign treasury cap to different holder
                  </label>
                </div>
                {formData.differentTreasuryHolder && (
                  <div className="form-group">
                    <label htmlFor="treasuryCapHolder">Treasury Cap Holder Address</label>
                    <input
                      type="text"
                      id="treasuryCapHolder"
                      name="treasuryCapHolder"
                      value={formData.treasuryCapHolder}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="form-input"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'optional' && (
            <div className="tab-content">
              <h2>Optional Features</h2>

              {/* Mintable */}
              <div className="form-section">
                <h3>Mintable</h3>
                <p className="section-description">Allow minting of additional tokens after creation</p>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isMintable"
                      checked={formData.isMintable}
                      onChange={handleInputChange}
                    />
                    Enable minting capability
                  </label>
                </div>
                <div className="feature-description">
                  <p>✓ Treasury cap holder can mint unlimited tokens</p>
                  <p>✓ Can be revoked anytime</p>
                </div>
              </div>

              {/* Freezable */}
              <div className="form-section">
                <h3>Freezable</h3>
                <p className="section-description">Create deny cap authority to freeze addresses</p>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isFreezable"
                      checked={formData.isFreezable}
                      onChange={handleInputChange}
                    />
                    Enable freeze functionality
                  </label>
                </div>
                <div className="feature-description">
                  <p>✓ Freeze addresses instantly</p>
                  <p>✓ Next epoch: frozen addresses cannot receive tokens</p>
                  <p>⚠️ Creates deny cap with special authority</p>
                </div>
              </div>

              {/* Pausable */}
              <div className="form-section">
                <h3>Pausable</h3>
                <p className="section-description">Pause all transfers globally with one transaction</p>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isPausable"
                      checked={formData.isPausable}
                      onChange={handleInputChange}
                      disabled={!formData.isFreezable}
                    />
                    Enable pause capability
                  </label>
                </div>
                <div className="feature-description">
                  <p>✓ Pause all token transfers globally</p>
                  <p>✓ Preserves individual freeze status on unpause</p>
                  {!formData.isFreezable && <p className="warning">⚠️ Requires Freezable to be enabled</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="tab-content">
              <h2>Token Metadata</h2>

              {/* Token Logo */}
              <div className="form-section">
                <h3>Token Logo</h3>
                <p className="section-description">Stored permanently on IPFS</p>
                <div className="form-group">
                  <label htmlFor="tokenLogo">IPFS Logo URL or Upload</label>
                  <input
                    type="text"
                    id="tokenLogo"
                    name="tokenLogo"
                    value={formData.tokenLogo}
                    onChange={handleInputChange}
                    placeholder="ipfs://... or https://..."
                    className="form-input"
                  />
                  <small>Max 1 MB • PNG, JPG, WEBP • Square image (1:1 ratio) recommended</small>
                </div>
              </div>

              {/* Token Description */}
              <div className="form-section">
                <h3>Token Description</h3>
                <p className="section-description">Displayed in wallets and explorers</p>
                <div className="form-group">
                  <label htmlFor="tokenDescription">Description</label>
                  <textarea
                    id="tokenDescription"
                    name="tokenDescription"
                    value={formData.tokenDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your token's purpose, utility, and unique value..."
                    className="form-input"
                    rows={6}
                    maxLength={1000}
                  />
                  <small>{formData.tokenDescription.length}/1000 characters</small>
                </div>
              </div>

              {/* Immutable Metadata */}
              <div className="form-section">
                <h3>Metadata Authority</h3>
                <p className="section-description">Control over token name, symbol, and description</p>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isImmutableMetadata"
                      checked={formData.isImmutableMetadata}
                      onChange={handleInputChange}
                    />
                    Lock metadata as immutable
                  </label>
                </div>
                <div className="feature-description">
                  <p>✓ Metadata cannot be changed after deployment</p>
                  <p>✓ Provides security and trust to users</p>
                  <p>⚠️ Cannot be reverted once locked</p>
                </div>
              </div>

              {/* Summary */}
              <div className="form-section">
                <h3>Deployment Summary</h3>
                <div className="summary-box">
                  <div className="summary-item">
                    <span>Token Name:</span>
                    <strong>{formData.tokenName || '—'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Symbol:</span>
                    <strong>{formData.tokenSymbol || '—'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Module:</span>
                    <strong>{formData.moduleName || '—'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Decimals:</span>
                    <strong>{formData.decimals}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Initial Supply:</span>
                    <strong>{formData.initialSupply.toLocaleString()}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Features:</span>
                    <strong>
                      {[
                        formData.isMintable && 'Mintable',
                        formData.isFreezable && 'Freezable',
                        formData.isPausable && 'Pausable',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="token-creator-actions">
            <Button
              onClick={handleCreateToken}
              disabled={loading}
              size="3"
              className="create-button"
            >
              {loading ? '⏳ Creating Token...' : '✨ Create Token'}
            </Button>
            <Button
              onClick={() => setCreatedTokenAddress(null)}
              variant="soft"
              disabled={loading}
            >
              Reset Form
            </Button>
          </div>

          {/* Success Display */}
          {createdTokenAddress && (
            <div className="success-container">
              <h3>Token Created Successfully! 🎉</h3>
              <div className="address-display">
                <code>{createdTokenAddress}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(createdTokenAddress)}
                  className="copy-button"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenCreator;
