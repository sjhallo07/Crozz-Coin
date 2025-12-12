import React, { useState } from 'react';
import { AlertCircle, Lock, CheckCircle2, Shield } from 'lucide-react';
import styles from './TokenCreatorImmutability.module.css';

interface UnchangeableValue {
  field: string;
  description: string;
  example: string;
}

const UNCHANGEABLE_VALUES: UnchangeableValue[] = [
  {
    field: 'Blockchain',
    description: 'The network your token is deployed on (Sui Mainnet, Testnet, or Devnet)',
    example: 'Mainnet, Testnet, or Devnet'
  },
  {
    field: 'Module Name',
    description: 'The unique identifier for your token\'s smart contract module',
    example: 'my_token, crozz_coin, token_factory'
  },
  {
    field: 'Decimals',
    description: 'The number of decimal places your token supports (0-9)',
    example: '6 decimals for stablecoins, 9 for standard tokens'
  },
  {
    field: 'Total Supply',
    description: 'The maximum number of tokens that can ever exist (if treasury cap is revoked)',
    example: '1,000,000 or 18,400,000,000 tokens'
  }
];

export const TokenCreatorImmutability: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={styles.immutabilityContainer}>
      {/* Alert Header */}
      <div className={styles.alertHeader}>
        <AlertCircle size={20} className={styles.alertIcon} />
        <h3>Unchangeable Sui Values</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Quick Summary */}
      <div className={styles.quickSummary}>
        <Shield size={16} className={styles.shieldIcon} />
        <p>
          Some token settings are permanently saved on-chain and cannot be changed,
          even by authority wallets. Choose these values carefully before deployment.
        </p>
      </div>

      {/* Detailed List */}
      {showDetails && (
        <div className={styles.detailsList}>
          {UNCHANGEABLE_VALUES.map((item, index) => (
            <div key={index} className={styles.unchangeableItem}>
              <div className={styles.itemHeader}>
                <Lock size={16} className={styles.lockIcon} />
                <span className={styles.fieldName}>{item.field}</span>
              </div>
              <p className={styles.description}>{item.description}</p>
              <div className={styles.exampleBox}>
                <span className={styles.exampleLabel}>Example:</span>
                <span className={styles.exampleValue}>{item.example}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Message */}
      <div className={styles.warningBox}>
        <AlertCircle size={18} className={styles.warningIcon} />
        <div className={styles.warningText}>
          <strong>Important:</strong> Make sure you carefully consider these settings
          before deploying your token, as they will be permanent for the entire lifetime
          of your token on the Sui blockchain.
        </div>
      </div>

      {/* Changeable Values */}
      <div className={styles.changeableSection}>
        <div className={styles.changeableHeader}>
          <CheckCircle2 size={18} className={styles.checkIcon} />
          <h4>What Can Still Be Changed</h4>
        </div>
        <p className={styles.changeableText}>
          Token name, symbol, description, logo, and authority assignments can be
          modified later by authority wallets within similar limits as available in
          the generator.
        </p>
      </div>
    </div>
  );
};

export default TokenCreatorImmutability;
