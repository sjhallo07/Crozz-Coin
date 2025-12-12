import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ExternalLink, Copy, Shield } from 'lucide-react';
import styles from './TokenVerification.module.css';

interface VerificationMethod {
  id: string;
  name: string;
  label: string;
  description: string;
  automatic: boolean;
  requiresManual: boolean;
  benefits: string[];
}

const VERIFICATION_METHODS: VerificationMethod[] = [
  {
    id: '20lab_label',
    name: 'Verify with 20lab Label',
    label: '20lab',
    description: 'Token verified on 20lab.app. Shows automatic verification badge.',
    automatic: true,
    requiresManual: false,
    benefits: [
      'Automatic verification on supported explorers',
      '20lab verification badge displayed',
      'Verified token indicator in wallets',
      'Enhanced trust and credibility'
    ]
  },
  {
    id: 'custom_label',
    name: 'Verify with Custom Label',
    label: 'Custom',
    description: 'Use your own project label for verification. Supports both automatic and manual methods.',
    automatic: true,
    requiresManual: true,
    benefits: [
      'Custom branding and project label',
      'Project information displayed',
      'Flexibility for manual verification',
      'Full control over verification appearance'
    ]
  }
];

interface TokenVerificationProps {
  tokenAddress?: string;
  isVerified?: boolean;
  verificationMethod?: string;
}

export const TokenVerification: React.FC<TokenVerificationProps> = ({
  tokenAddress = '',
  isVerified = false,
  verificationMethod = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('20lab_label');
  const [customLabel, setCustomLabel] = useState('');
  const [verificationStep, setVerificationStep] = useState<'select' | 'configure' | 'verify'>('select');
  const [copied, setCopied] = useState(false);

  const selectedMethodData = VERIFICATION_METHODS.find(m => m.id === selectedMethod);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (selectedMethod === 'custom_label' && !customLabel) {
      alert('Please enter a custom label');
      return;
    }
    setVerificationStep('verify');
  };

  return (
    <div className={styles.verificationContainer}>
      {/* Status Header */}
      {isVerified ? (
        <div className={styles.statusBanner + ' ' + styles.verified}>
          <CheckCircle2 size={20} className={styles.statusIcon} />
          <div className={styles.statusText}>
            <strong>Token Verified</strong>
            <p>Your token source code has been verified on the block explorer</p>
          </div>
        </div>
      ) : (
        <div className={styles.statusBanner + ' ' + styles.unverified}>
          <AlertCircle size={20} className={styles.statusIcon} />
          <div className={styles.statusText}>
            <strong>Not Verified</strong>
            <p>Verify your token source code to build trust and transparency</p>
          </div>
        </div>
      )}

      {/* Verification Info */}
      <div className={styles.verificationInfo}>
        <Shield size={16} className={styles.infoIcon} />
        <div>
          <strong>What is Verification?</strong>
          <p>
            Verification makes your token's complete source code publicly visible on the block explorer.
            Anyone can confirm your token is secure and see exactly what functions it has.
          </p>
        </div>
      </div>

      {verificationStep === 'select' && (
        <>
          {/* Method Selection */}
          <div className={styles.methodsContainer}>
            <h3>Select Verification Method</h3>
            <div className={styles.methodsList}>
              {VERIFICATION_METHODS.map((method) => (
                <button
                  key={method.id}
                  className={`${styles.methodCard} ${selectedMethod === method.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className={styles.methodHeader}>
                    <span className={styles.methodName}>{method.name}</span>
                    {method.automatic && (
                      <span className={styles.automaticBadge}>Automatic</span>
                    )}
                  </div>
                  <p className={styles.methodDescription}>{method.description}</p>
                  <div className={styles.benefitsList}>
                    {method.benefits.map((benefit, idx) => (
                      <div key={idx} className={styles.benefitItem}>
                        <CheckCircle2 size={14} className={styles.checkMark} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Step */}
          <div className={styles.configSection}>
            <h3>Configuration</h3>
            
            {selectedMethod === 'custom_label' && (
              <div className={styles.inputGroup}>
                <label htmlFor="customLabel">Custom Label</label>
                <input
                  id="customLabel"
                  type="text"
                  placeholder="e.g., Crozz Coin Team, MyProject"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className={styles.input}
                />
                <small>This label will appear at the top of your verified token page</small>
              </div>
            )}

            {tokenAddress && (
              <div className={styles.inputGroup}>
                <label>Token Address</label>
                <div className={styles.addressBox}>
                  <code>{tokenAddress}</code>
                  <button
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(tokenAddress)}
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            className={styles.verifyButton}
            onClick={handleVerify}
            disabled={selectedMethod === 'custom_label' && !customLabel}
          >
            Continue to Verification
          </button>
        </>
      )}

      {verificationStep === 'verify' && (
        <>
          {/* Verification Instructions */}
          <div className={styles.instructionsSection}>
            <h3>Verification Instructions</h3>
            
            {selectedMethod === '20lab_label' && (
              <div className={styles.instructionsList}>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>1</span>
                  <div>
                    <strong>Go to Sui Block Explorer</strong>
                    <p>Navigate to the block explorer for the network your token is deployed on</p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>2</span>
                  <div>
                    <strong>Search Your Token</strong>
                    <p>Search for your token address or module name in the explorer</p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>3</span>
                  <div>
                    <strong>Verify Source Code</strong>
                    <p>Select "Verify with 20lab label" option on the verification page</p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>4</span>
                  <div>
                    <strong>Automatic Verification</strong>
                    <p>Your token will be automatically verified and marked as verified</p>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'custom_label' && (
              <div className={styles.instructionsList}>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>1</span>
                  <div>
                    <strong>Get Verification Data</strong>
                    <p>Copy the verification data from 20lab dashboard for your token</p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>2</span>
                  <div>
                    <strong>Go to Block Explorer</strong>
                    <p>Navigate to your token on the Sui block explorer</p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>3</span>
                  <div>
                    <strong>Select Custom Label</strong>
                    <p>Choose "Verify with custom label" and enter: <code>{customLabel}</code></p>
                  </div>
                </div>
                <div className={styles.instructionStep}>
                  <span className={styles.stepNumber}>4</span>
                  <div>
                    <strong>Manual Verification Option</strong>
                    <p>If automatic verification isn't available, use manual verification method</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className={styles.notesBox}>
            <AlertCircle size={18} className={styles.noteIcon} />
            <div>
              <strong>Important Notes:</strong>
              <ul>
                <li>Verification is not available for Testnet tokens</li>
                <li>Some block explorers may only support manual verification</li>
                <li>Once verified, the source code is immutable and permanent</li>
                <li>Keep your custom label consistent with your project branding</li>
              </ul>
            </div>
          </div>

          {/* Back Button */}
          <button
            className={styles.backButton}
            onClick={() => setVerificationStep('select')}
          >
            ← Back to Method Selection
          </button>
        </>
      )}
    </div>
  );
};

export default TokenVerification;
