import React, { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import {
  Lock,
  TrendingUp,
  Vote,
  DollarSign,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from 'lucide-react';
import styles from './StakingGovernance.module.css';

interface StakeInfo {
  amount: number;
  stakedTime: Date;
  pendingRewards: number;
  lastClaimTime: Date;
}

interface ProposalInfo {
  id: string;
  title: string;
  description: string;
  type: 'parameter' | 'feature' | 'emergency';
  votesFor: number;
  votesAgainst: number;
  endDate: Date;
  status: 'active' | 'passed' | 'rejected' | 'executed';
}

const StakingGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stake' | 'rewards' | 'governance'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [userStakes, setUserStakes] = useState<StakeInfo[]>([]);
  const [proposals, setProposals] = useState<ProposalInfo[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRewards, setTotalRewards] = useState(0);
  const [voting, setVoting] = useState<{ [key: string]: boolean }>({});

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  // Calculate APY
  const calculateAPY = () => {
    return 5; // 5% APY from contract
  };

  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      // This would call the smart contract stake function
      // const result = await client.executeTransaction(tx);
      
      const newStake: StakeInfo = {
        amount: parseFloat(stakeAmount),
        stakedTime: new Date(),
        pendingRewards: 0,
        lastClaimTime: new Date(),
      };

      setUserStakes([...userStakes, newStake]);
      setStakeAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Staking failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle unstaking
  const handleUnstake = async (stakeIndex: number) => {
    setLoading(true);
    setError(null);

    try {
      const stake = userStakes[stakeIndex];
      const rewards = calculateRewards(stake.amount, stake.stakedTime);
      
      setTotalRewards(totalRewards + rewards);
      setUserStakes(userStakes.filter((_, i) => i !== stakeIndex));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unstaking failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle claim rewards
  const handleClaimRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would call the smart contract claim function
      setTotalRewards(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate rewards based on time staked
  const calculateRewards = (amount: number, stakedTime: Date): number => {
    const now = new Date();
    const hoursStaked =
      (now.getTime() - stakedTime.getTime()) / (1000 * 60 * 60);
    const dailyReward = (amount * 5) / 100 / 365;
    return (dailyReward / 24) * hoursStaked;
  };

  // Handle voting
  const handleVote = async (proposalId: string, voteFor: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      // This would call the smart contract vote function
      
      setVoting({ ...voting, [proposalId]: voteFor });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setLoading(false);
    }
  };

  // Mock load proposals
  useEffect(() => {
    setProposals([
      {
        id: '1',
        title: 'Increase Staking Reward Rate',
        description: 'Proposal to increase APY from 5% to 7%',
        type: 'parameter',
        votesFor: 45000000,
        votesAgainst: 15000000,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: '2',
        title: 'Add New Trading Pair',
        description: 'Enable trading for CROZ/USDC pair on DEX',
        type: 'feature',
        votesFor: 60000000,
        votesAgainst: 5000000,
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    ]);
  }, []);

  const calculateTotalStaked = () => {
    return userStakes.reduce((sum, stake) => sum + stake.amount, 0);
  };

  const calculatePendingRewards = () => {
    return userStakes.reduce((sum, stake) => {
      return sum + calculateRewards(stake.amount, stake.stakedTime);
    }, 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Staking & Governance</h1>
        <p>Stake CROZ tokens and participate in governance decisions</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8b5cf6' }}>
            <Lock size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Staked</h3>
            <p>{calculateTotalStaked().toLocaleString()} CROZ</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#06b6d4' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Pending Rewards</h3>
            <p>{calculatePendingRewards().toFixed(2)} CROZ</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ec4899' }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Rewards</h3>
            <p>{totalRewards.toFixed(2)} CROZ</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Current APY</h3>
            <p>{calculateAPY()}%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'stake' ? styles.active : ''}`}
          onClick={() => setActiveTab('stake')}
        >
          <Lock size={18} /> Stake
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'rewards' ? styles.active : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          <TrendingUp size={18} /> Rewards
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'governance' ? styles.active : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          <Vote size={18} /> Governance
        </button>
      </div>

      {/* Staking Tab */}
      {activeTab === 'stake' && (
        <div className={styles.tabContent}>
          <div className={styles.stakeForm}>
            <h2>Stake Your CROZ Tokens</h2>
            <div className={styles.formGroup}>
              <label>Staking Amount</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount in CROZ"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
                <span className={styles.currency}>CROZ</span>
              </div>
              <small>Minimum: 1 CROZ</small>
            </div>

            <div className={styles.infoBox}>
              <h3>Staking Benefits</h3>
              <ul>
                <li>
                  <CheckCircle2 size={16} /> Earn {calculateAPY()}% APY on your stake
                </li>
                <li>
                  <CheckCircle2 size={16} /> Vote on governance proposals
                </li>
                <li>
                  <CheckCircle2 size={16} /> Share in protocol fees
                </li>
                <li>
                  <CheckCircle2 size={16} /> Flexible unstaking anytime
                </li>
              </ul>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleStake}
              disabled={loading || !stakeAmount}
            >
              {loading ? 'Processing...' : 'Stake Tokens'}
            </button>
          </div>

          {/* Active Stakes */}
          {userStakes.length > 0 && (
            <div className={styles.stakesSection}>
              <h2>Your Active Stakes</h2>
              <div className={styles.stakesGrid}>
                {userStakes.map((stake, index) => (
                  <div key={index} className={styles.stakeCard}>
                    <div className={styles.stakeHeader}>
                      <h3>{stake.amount.toLocaleString()} CROZ</h3>
                      <span className={styles.badge}>Active</span>
                    </div>

                    <div className={styles.stakeDetails}>
                      <div className={styles.detail}>
                        <span>Staked Since</span>
                        <strong>{stake.stakedTime.toLocaleDateString()}</strong>
                      </div>
                      <div className={styles.detail}>
                        <span>Pending Rewards</span>
                        <strong>{calculateRewards(stake.amount, stake.stakedTime).toFixed(4)} CROZ</strong>
                      </div>
                    </div>

                    <button
                      className={styles.secondaryBtn}
                      onClick={() => handleUnstake(index)}
                      disabled={loading}
                    >
                      <ArrowDownLeft size={16} /> Unstake
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className={styles.tabContent}>
          <div className={styles.rewardsSection}>
            <h2>Reward Summary</h2>

            <div className={styles.rewardCard}>
              <div className={styles.rewardItem}>
                <h3>Pending Rewards</h3>
                <p className={styles.largeAmount}>
                  {calculatePendingRewards().toFixed(4)} CROZ
                </p>
              </div>
              <div className={styles.rewardItem}>
                <h3>Total Claimed</h3>
                <p className={styles.largeAmount}>{totalRewards.toFixed(4)} CROZ</p>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleClaimRewards}
              disabled={loading || calculatePendingRewards() === 0}
            >
              <ArrowUpRight size={18} /> Claim Rewards
            </button>

            {/* Reward History */}
            <div className={styles.historySection}>
              <h3>Staking History</h3>
              <div className={styles.historyTable}>
                <div className={styles.historyHeader}>
                  <span>Amount</span>
                  <span>Staked Date</span>
                  <span>Earned</span>
                </div>
                {userStakes.map((stake, index) => (
                  <div key={index} className={styles.historyRow}>
                    <span>{stake.amount} CROZ</span>
                    <span>{stake.stakedTime.toLocaleDateString()}</span>
                    <span className={styles.positive}>
                      +{calculateRewards(stake.amount, stake.stakedTime).toFixed(4)} CROZ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Governance Tab */}
      {activeTab === 'governance' && (
        <div className={styles.tabContent}>
          <div className={styles.governanceSection}>
            <h2>Active Proposals</h2>

            {proposals.length === 0 ? (
              <div className={styles.emptyState}>
                <Vote size={48} />
                <p>No active proposals at the moment</p>
              </div>
            ) : (
              <div className={styles.proposalsList}>
                {proposals.map((proposal) => {
                  const totalVotes = proposal.votesFor + proposal.votesAgainst;
                  const percentFor =
                    totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                  const hasVoted = voting[proposal.id] !== undefined;

                  return (
                    <div key={proposal.id} className={styles.proposalCard}>
                      <div className={styles.proposalHeader}>
                        <div>
                          <h3>{proposal.title}</h3>
                          <span className={`${styles.badge} ${styles[proposal.type]}`}>
                            {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                          </span>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${styles[proposal.status]}`}
                        >
                          {proposal.status.toUpperCase()}
                        </span>
                      </div>

                      <p className={styles.proposalDescription}>
                        {proposal.description}
                      </p>

                      <div className={styles.votingSection}>
                        <div className={styles.voteChart}>
                          <div className={styles.voteBar}>
                            <div
                              className={styles.voteFill}
                              style={{ width: `${percentFor}%` }}
                            ></div>
                          </div>
                          <div className={styles.voteStats}>
                            <span>
                              <strong>{percentFor.toFixed(1)}%</strong> For
                            </span>
                            <span>
                              <strong>{(100 - percentFor).toFixed(1)}%</strong> Against
                            </span>
                          </div>
                        </div>

                        <div className={styles.voteNumbers}>
                          <div>For: {proposal.votesFor.toLocaleString()}</div>
                          <div>Against: {proposal.votesAgainst.toLocaleString()}</div>
                        </div>

                        <div className={styles.endDate}>
                          <Calendar size={16} />
                          Ends:{' '}
                          {proposal.endDate.toLocaleDateString()} at{' '}
                          {proposal.endDate.toLocaleTimeString()}
                        </div>
                      </div>

                      {proposal.status === 'active' && (
                        <div className={styles.votingButtons}>
                          <button
                            className={`${styles.voteBtn} ${styles.for} ${
                              hasVoted && voting[proposal.id] ? styles.voted : ''
                            }`}
                            onClick={() => handleVote(proposal.id, true)}
                            disabled={loading}
                          >
                            <ArrowUpRight size={16} /> Vote For
                          </button>
                          <button
                            className={`${styles.voteBtn} ${styles.against} ${
                              hasVoted && !voting[proposal.id] ? styles.voted : ''
                            }`}
                            onClick={() => handleVote(proposal.id, false)}
                            disabled={loading}
                          >
                            <ArrowDownLeft size={16} /> Vote Against
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingGovernance;
