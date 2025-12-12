/**
 * Staking & Governance SDK for Crozz Coin
 * 
 * Provides TypeScript interfaces and transaction builders for interacting with
 * the staking and governance smart contracts.
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// ======================== Types ========================

export interface StakingConfig {
  packageId: string;
  poolAddress: string;
  minStakeAmount: bigint;
  rewardRate: number; // Percentage (e.g., 5 for 5%)
}

export interface StakeRecord {
  id: string;
  owner: string;
  amount: bigint;
  stakedTimestamp: number;
  lastRewardClaim: number;
  pendingRewards: bigint;
}

export interface ProposalRecord {
  id: string;
  proposer: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  votesFor: bigint;
  votesAgainst: bigint;
  createdTimestamp: number;
  votingEndTimestamp: number;
  executionTimestamp: number;
  status: ProposalStatus;
  minVotingPowerRequired: bigint;
}

export interface VoteRecord {
  id: string;
  voter: string;
  proposalId: string;
  vote: boolean; // true = for, false = against
  votingPower: bigint;
  voteTimestamp: number;
}

export interface GovernanceParams {
  takerFeeBps: number; // Basis points (0.01% = 1 bps)
  makerFeeBps: number;
  minStakeAmount: bigint;
  rewardRate: number;
  votingPeriodDays: number;
  executionDelayDays: number;
}

export type ProposalType = 'parameter' | 'feature' | 'emergency';

export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
  Executed = 4,
}

// ======================== Transaction Builders ========================

/**
 * Staking Transaction Builder
 * 
 * Handles all staking-related transactions
 */
export class StakingTransactionBuilder {
  constructor(private config: StakingConfig) {}

  /**
   * Build a stake transaction
   */
  buildStakeTransaction(
    tx: Transaction,
    amount: bigint,
    clockObjectId: string,
  ): Transaction {
    const coinInput = tx.splitCoins(tx.gas, [tx.pure(amount)]);

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::stake`,
      arguments: [
        tx.object(this.config.poolAddress),
        coinInput,
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build an unstake transaction
   */
  buildUnstakeTransaction(
    tx: Transaction,
    stakeRecordId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::unstake`,
      arguments: [
        tx.object(this.config.poolAddress),
        tx.object(stakeRecordId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build a claim rewards transaction
   */
  buildClaimRewardsTransaction(
    tx: Transaction,
    stakeRecordId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::claim_rewards`,
      arguments: [
        tx.object(stakeRecordId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Calculate rewards for a given stake amount and duration
   */
  calculateRewards(amount: bigint, durationMs: number): bigint {
    const durationDays = durationMs / (24 * 60 * 60 * 1000);
    const durationYears = durationDays / 365;
    const annualReward = (amount * BigInt(this.config.rewardRate)) / BigInt(100);
    return (annualReward * BigInt(Math.floor(durationYears * 1000))) / BigInt(1000);
  }

  /**
   * Calculate annual percentage yield
   */
  getAPY(): number {
    return this.config.rewardRate;
  }
}

/**
 * Governance Transaction Builder
 * 
 * Handles all governance-related transactions
 */
export class GovernanceTransactionBuilder {
  constructor(private config: StakingConfig) {}

  /**
   * Build a create proposal transaction
   */
  buildCreateProposalTransaction(
    tx: Transaction,
    title: string,
    description: string,
    proposalType: ProposalType,
    stakeRecordId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::create_proposal`,
      arguments: [
        tx.pure(title),
        tx.pure(description),
        tx.pure(this.encodeProposalType(proposalType)),
        tx.object(stakeRecordId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build a vote transaction
   */
  buildVoteTransaction(
    tx: Transaction,
    proposalId: string,
    stakeRecordId: string,
    voteFor: boolean,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::vote_on_proposal`,
      arguments: [
        tx.object(proposalId),
        tx.object(stakeRecordId),
        tx.pure(voteFor),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build a finalize proposal transaction
   */
  buildFinalizeProposalTransaction(
    tx: Transaction,
    proposalId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::finalize_proposal`,
      arguments: [
        tx.object(proposalId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build an update governance parameter transaction
   */
  buildUpdateParameterTransaction(
    tx: Transaction,
    paramsObjectId: string,
    paramName: 'taker_fee' | 'maker_fee' | 'reward_rate',
    newValue: number,
  ): Transaction {
    const functionName = `update_${paramName}`;

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::${functionName}`,
      arguments: [
        tx.object(paramsObjectId),
        tx.pure(newValue),
      ],
    });
  }

  /**
   * Encode proposal type to numeric value
   */
  private encodeProposalType(type: ProposalType): number {
    const map: Record<ProposalType, number> = {
      parameter: 1,
      feature: 2,
      emergency: 3,
    };
    return map[type];
  }

  /**
   * Decode numeric proposal type
   */
  static decodeProposalType(value: number): ProposalType {
    const map: Record<number, ProposalType> = {
      1: 'parameter',
      2: 'feature',
      3: 'emergency',
    };
    return map[value] || 'feature';
  }
}

// ======================== Query Helpers ========================

/**
 * Query helper for fetching staking data
 */
export class StakingQueryHelper {
  constructor(
    private client: SuiClient,
    private config: StakingConfig,
  ) {}

  /**
   * Get total staked amount in the pool
   */
  async getTotalStaked(): Promise<bigint> {
    const poolObject = await this.client.getObject({
      id: this.config.poolAddress,
      options: { showContent: true },
    });

    if (poolObject.data?.content?.dataType === 'moveObject') {
      const fields = (poolObject.data.content as any).fields;
      return BigInt(fields.total_staked);
    }

    throw new Error('Failed to fetch total staked amount');
  }

  /**
   * Get user's stake records
   */
  async getUserStakes(userAddress: string): Promise<StakeRecord[]> {
    const objects = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.config.packageId}::staking_governance::StakeEvent`,
      },
    });

    return objects.data
      .filter(
        (event: any) => event.parsedJson.staker === userAddress,
      )
      .map((event: any) => ({
        id: event.id.txDigest,
        owner: event.parsedJson.staker,
        amount: BigInt(event.parsedJson.amount),
        stakedTimestamp: event.parsedJson.timestamp,
        lastRewardClaim: event.parsedJson.timestamp,
        pendingRewards: BigInt(0),
      }));
  }

  /**
   * Get staking rewards for a user
   */
  async getUserRewards(userAddress: string): Promise<bigint> {
    const claimEvents = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.config.packageId}::staking_governance::RewardClaimedEvent`,
      },
    });

    return claimEvents.data
      .filter(
        (event: any) => event.parsedJson.staker === userAddress,
      )
      .reduce(
        (sum, event: any) => sum + BigInt(event.parsedJson.reward_amount),
        BigInt(0),
      );
  }
}

/**
 * Query helper for governance operations
 */
export class GovernanceQueryHelper {
  constructor(
    private client: SuiClient,
    private config: StakingConfig,
  ) {}

  /**
   * Get all active proposals
   */
  async getActiveProposals(): Promise<ProposalRecord[]> {
    const events = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.config.packageId}::staking_governance::ProposalCreatedEvent`,
      },
    });

    return events.data.map((event: any) => ({
      id: event.id.txDigest,
      proposer: event.parsedJson.proposer,
      title: event.parsedJson.title,
      description: '',
      proposalType: GovernanceTransactionBuilder.decodeProposalType(
        event.parsedJson.proposal_type,
      ),
      votesFor: BigInt(0),
      votesAgainst: BigInt(0),
      createdTimestamp: event.parsedJson.timestamp,
      votingEndTimestamp: event.parsedJson.voting_end_timestamp,
      executionTimestamp: 0,
      status: ProposalStatus.Active,
      minVotingPowerRequired: BigInt(1_000_000),
    }));
  }

  /**
   * Get user's votes
   */
  async getUserVotes(userAddress: string): Promise<VoteRecord[]> {
    const events = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.config.packageId}::staking_governance::VoteSubmittedEvent`,
      },
    });

    return events.data
      .filter(
        (event: any) => event.parsedJson.voter === userAddress,
      )
      .map((event: any) => ({
        id: event.id.txDigest,
        voter: event.parsedJson.voter,
        proposalId: event.parsedJson.proposal_id,
        vote: event.parsedJson.vote,
        votingPower: BigInt(event.parsedJson.voting_power),
        voteTimestamp: event.parsedJson.timestamp,
      }));
  }

  /**
   * Get proposal details
   */
  async getProposalDetails(proposalId: string): Promise<ProposalRecord | null> {
    try {
      const proposal = await this.client.getObject({
        id: proposalId,
        options: { showContent: true },
      });

      if (proposal.data?.content?.dataType === 'moveObject') {
        const fields = (proposal.data.content as any).fields;
        return {
          id: proposalId,
          proposer: fields.proposer,
          title: fields.title,
          description: fields.description,
          proposalType: GovernanceTransactionBuilder.decodeProposalType(
            fields.proposal_type,
          ),
          votesFor: BigInt(fields.votes_for),
          votesAgainst: BigInt(fields.votes_against),
          createdTimestamp: fields.created_timestamp,
          votingEndTimestamp: fields.voting_end_timestamp,
          executionTimestamp: fields.execution_timestamp,
          status: fields.status,
          minVotingPowerRequired: BigInt(fields.min_voting_power_required),
        };
      }
    } catch (error) {
      console.error('Failed to fetch proposal details:', error);
    }

    return null;
  }
}

// ======================== Helper Functions ========================

/**
 * Format amount with decimal places
 */
export function formatAmount(amount: bigint, decimals: number = 6): number {
  return Number(amount) / Math.pow(10, decimals);
}

/**
 * Convert amount to on-chain representation
 */
export function toOnChainAmount(amount: number, decimals: number = 6): bigint {
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

/**
 * Calculate voting power from stake amount
 */
export function calculateVotingPower(stakeAmount: bigint): bigint {
  // 1 CROZ = 1 voting power
  return stakeAmount;
}

/**
 * Check if proposal can be executed
 */
export function canExecuteProposal(proposal: ProposalRecord): boolean {
  return (
    proposal.status === ProposalStatus.Passed &&
    Date.now() >= proposal.executionTimestamp
  );
}

/**
 * Calculate proposal outcome
 */
export function getProposalOutcome(proposal: ProposalRecord): {
  passed: boolean;
  supportPercentage: number;
} {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const supportPercentage =
    totalVotes > 0 ? Number((proposal.votesFor * BigInt(100)) / totalVotes) : 0;

  return {
    passed:
      proposal.votesFor > proposal.votesAgainst &&
      totalVotes >= proposal.minVotingPowerRequired,
    supportPercentage,
  };
}
