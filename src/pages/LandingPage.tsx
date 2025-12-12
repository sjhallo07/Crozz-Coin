import React from 'react';
import { ArrowRight, Zap, Shield, Coins, TrendingUp, Users, Cpu, Award } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Coins className={styles.featureIcon} />,
      title: 'CROZ Token',
      description: 'Advanced token creation with immutability verification and real-time tracking',
    },
    {
      icon: <Zap className={styles.featureIcon} />,
      title: 'Staking & Governance',
      description: 'Earn 5% APY through staking and participate in community governance',
    },
    {
      icon: <Shield className={styles.featureIcon} />,
      title: 'Security First',
      description: 'Built on Sui blockchain with immutable smart contracts and role-based access control',
    },
    {
      icon: <TrendingUp className={styles.featureIcon} />,
      title: 'Real-Time Analytics',
      description: 'Track staking rewards, token supply, and governance voting in real-time',
    },
    {
      icon: <Users className={styles.featureIcon} />,
      title: 'Community Driven',
      description: 'Democratic governance model where token holders shape the future',
    },
    {
      icon: <Cpu className={styles.featureIcon} />,
      title: 'Web3 Native',
      description: 'Decentralized architecture built on Sui Move language with full transparency',
    },
  ];

  const stats = [
    { label: 'Minimum Stake', value: '1 CROZ' },
    { label: 'APY Rewards', value: '5%' },
    { label: 'Voting Period', value: '7 Days' },
    { label: 'Execution Delay', value: '2 Days' },
  ];

  return (
    <div className={styles.landingPage}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Coins className={styles.logoIcon} />
            <span>CROZZ COIN</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#stats">Stats</a>
            <a href="#whitepaper">Whitepaper</a>
            <button className={styles.ctaButton}>Launch App</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            The Future of <span className={styles.gradient}>Decentralized Finance</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Advanced token creation, staking rewards, and democratic governance on the Sui blockchain
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryButton}>
              Launch Application <ArrowRight size={20} />
            </button>
            <button className={styles.secondaryButton}>
              Read Whitepaper
            </button>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Powerful Features</h2>
          <p>Everything you need for advanced token management and governance</p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Simple steps to get started with CROZZ Coin</p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Connect Wallet</h3>
            <p>Connect your Sui wallet to get started in seconds</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Create or Stake</h3>
            <p>Create tokens with immutability or stake CROZ for rewards</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Participate</h3>
            <p>Vote on proposals and govern the ecosystem</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Earn Rewards</h3>
            <p>Earn continuous staking rewards for your participation</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={styles.stats}>
        <div className={styles.statGrid}>
          <div className={styles.largeStatCard}>
            <Award className={styles.largeStatIcon} />
            <div className={styles.largeStatContent}>
              <h3>Governance Model</h3>
              <p>Democratic voting with 3 proposal types: Technical, Parameter, and Emergency</p>
            </div>
          </div>
          <div className={styles.largeStatCard}>
            <Shield className={styles.largeStatIcon} />
            <div className={styles.largeStatContent}>
              <h3>Token Immutability</h3>
              <p>All tokens are verified immutable on-chain with permanent supply verification</p>
            </div>
          </div>
          <div className={styles.largeStatCard}>
            <TrendingUp className={styles.largeStatIcon} />
            <div className={styles.largeStatContent}>
              <h3>Staking Rewards</h3>
              <p>Earn 5% APY on staked CROZ with real-time reward calculation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Whitepaper Section */}
      <section id="whitepaper" className={styles.whitepaper}>
        <div className={styles.whitepaperContent}>
          <h2>Comprehensive Whitepaper</h2>
          <p>
            CROZZ Coin is built on advanced Web3 principles with a focus on transparency, security, and community governance.
            Our whitepaper outlines the complete architecture, token economics, and governance mechanisms.
          </p>
          <div className={styles.whitepaperFeatures}>
            <div className={styles.wpFeature}>
              <h4>🏗️ Architecture</h4>
              <p>Sui Move smart contracts with admin RBAC system</p>
            </div>
            <div className={styles.wpFeature}>
              <h4>💰 Tokenomics</h4>
              <p>Fixed 1 CROZ minimum stake, 5% APY rewards, no inflation</p>
            </div>
            <div className={styles.wpFeature}>
              <h4>🗳️ Governance</h4>
              <p>3 proposal types, 7-day voting, 2-day execution</p>
            </div>
            <div className={styles.wpFeature}>
              <h4>🔐 Security</h4>
              <p>Move language immutability, role-based access, event logging</p>
            </div>
          </div>
          <button className={styles.downloadButton}>
            Download Full Whitepaper
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCta}>
        <h2>Ready to Join the Future?</h2>
        <p>Start earning rewards and participating in governance today</p>
        <button className={styles.largePrimaryButton}>
          Launch CROZZ Coin App
        </button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>CROZZ Coin</h4>
            <p>Advanced token creation and staking on Sui blockchain</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Resources</h4>
            <ul>
              <li><a href="#whitepaper">Whitepaper</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#github">GitHub</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Community</h4>
            <ul>
              <li><a href="#discord">Discord</a></li>
              <li><a href="#twitter">Twitter</a></li>
              <li><a href="#forum">Forum</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <ul>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 CROZZ Coin. All rights reserved. Built on Sui blockchain.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
