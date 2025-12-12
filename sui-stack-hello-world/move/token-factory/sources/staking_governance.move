// Copyright (c) Crozz Coin, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Module: staking_governance
/// 
/// Staking and governance module for Crozz Coin token.
/// Handles staking mechanics, reward distribution, and governance voting.
module token_factory::staking_governance {
    use sui::{
        object::{Self, UID, ID},
        tx_context::{Self, TxContext},
        transfer,
        coin::{Self, Coin},
        balance::{Self, Balance},
        event,
        clock::{Self, Clock},
    };
    use std::string::String;

    // ======================== Error Codes ========================

    const E_INVALID_STAKE_AMOUNT: u64 = 0;
    const E_INSUFFICIENT_STAKE: u64 = 1;
    const E_INVALID_PROPOSAL_ID: u64 = 2;
    const E_PROPOSAL_EXPIRED: u64 = 3;
    const E_NOT_STAKER: u64 = 4;
    const E_ALREADY_VOTED: u64 = 5;
    const E_INVALID_VOTING_POWER: u64 = 6;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 7;

    // ======================== Constants ========================

    const REWARD_RATE: u64 = 5; // 5% annual reward
    const MIN_STAKE_AMOUNT: u64 = 1_000_000; // Minimum 1 token
    const VOTING_PERIOD_DAYS: u64 = 7; // 7 days voting period
    const EXECUTION_DELAY_DAYS: u64 = 2; // 2 days execution delay

    // ======================== Structs ========================

    /// Global staking pool configuration
    public struct StakingPool has key {
        id: UID,
        total_staked: u64,
        total_rewards: Balance<sui::sui::SUI>,
        reward_per_epoch: u64,
        last_reward_timestamp: u64,
    }

    /// Individual stake record
    public struct StakeRecord has key {
        id: UID,
        owner: address,
        amount: u64,
        staking_timestamp: u64,
        last_reward_claim: u64,
        pending_rewards: u64,
    }

    /// Governance proposal
    public struct Proposal has key {
        id: UID,
        proposer: address,
        title: String,
        description: String,
        proposal_type: u8, // 1: Parameter, 2: Feature, 3: Emergency
        votes_for: u64,
        votes_against: u64,
        created_timestamp: u64,
        voting_end_timestamp: u64,
        execution_timestamp: u64,
        status: u8, // 0: Pending, 1: Active, 2: Passed, 3: Rejected, 4: Executed
        min_voting_power_required: u64,
    }

    /// Vote record
    public struct VoteRecord has key {
        id: UID,
        voter: address,
        proposal_id: ID,
        vote: bool, // true = for, false = against
        voting_power: u64,
        vote_timestamp: u64,
    }

    /// Governance parameters that can be changed via proposals
    public struct GovernanceParams has key {
        id: UID,
        taker_fee_bps: u16, // Basis points
        maker_fee_bps: u16,
        min_stake_amount: u64,
        reward_rate: u64,
        voting_period_days: u64,
        execution_delay_days: u64,
    }

    // ======================== Events ========================

    public struct StakeEvent has copy, drop {
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    public struct UnstakeEvent has copy, drop {
        staker: address,
        amount: u64,
        rewards_claimed: u64,
        timestamp: u64,
    }

    public struct RewardClaimedEvent has copy, drop {
        staker: address,
        reward_amount: u64,
        timestamp: u64,
    }

    public struct ProposalCreatedEvent has copy, drop {
        proposal_id: ID,
        proposer: address,
        title: String,
        proposal_type: u8,
        voting_end_timestamp: u64,
    }

    public struct VoteSubmittedEvent has copy, drop {
        proposal_id: ID,
        voter: address,
        vote: bool,
        voting_power: u64,
    }

    public struct ProposalExecutedEvent has copy, drop {
        proposal_id: ID,
        status: u8,
        timestamp: u64,
    }

    // ======================== Initialization ========================

    /// Initialize the staking pool and governance module
    public fun init_staking_pool(ctx: &mut TxContext) {
        let staking_pool = StakingPool {
            id: object::new(ctx),
            total_staked: 0,
            total_rewards: balance::zero(),
            reward_per_epoch: 100_000_000, // 100 SUI per epoch
            last_reward_timestamp: tx_context::epoch(ctx),
        };

        let governance_params = GovernanceParams {
            id: object::new(ctx),
            taker_fee_bps: 50, // 0.5%
            maker_fee_bps: 25, // 0.25%
            min_stake_amount: MIN_STAKE_AMOUNT,
            reward_rate: REWARD_RATE,
            voting_period_days: VOTING_PERIOD_DAYS,
            execution_delay_days: EXECUTION_DELAY_DAYS,
        };

        transfer::share_object(staking_pool);
        transfer::share_object(governance_params);
    }

    // ======================== Staking Functions ========================

    /// Stake tokens in the staking pool
    public fun stake<T>(
        pool: &mut StakingPool,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): StakeRecord {
        assert!(amount >= MIN_STAKE_AMOUNT, E_INVALID_STAKE_AMOUNT);

        let timestamp = clock::timestamp_ms(clock);
        let stake_record = StakeRecord {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            amount,
            staking_timestamp: timestamp,
            last_reward_claim: timestamp,
            pending_rewards: 0,
        };

        pool.total_staked = pool.total_staked + amount;

        event::emit(StakeEvent {
            staker: tx_context::sender(ctx),
            amount,
            timestamp,
        });

        stake_record
    }

    /// Unstake tokens and claim accumulated rewards
    public fun unstake(
        pool: &mut StakingPool,
        stake_record: StakeRecord,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (u64, u64) {
        let StakeRecord {
            id,
            owner,
            amount,
            staking_timestamp: _,
            last_reward_claim: _,
            pending_rewards,
        } = stake_record;

        assert!(owner == tx_context::sender(ctx), E_NOT_STAKER);

        let total_rewards = pending_rewards + calculate_rewards(amount, clock);
        pool.total_staked = pool.total_staked - amount;

        let timestamp = clock::timestamp_ms(clock);
        event::emit(UnstakeEvent {
            staker: owner,
            amount,
            rewards_claimed: total_rewards,
            timestamp,
        });

        object::delete(id);
        (amount, total_rewards)
    }

    /// Claim accumulated rewards from staking
    public fun claim_rewards(
        stake_record: &mut StakeRecord,
        clock: &Clock,
        ctx: &mut TxContext,
    ): u64 {
        assert!(stake_record.owner == tx_context::sender(ctx), E_NOT_STAKER);

        let rewards = calculate_rewards(stake_record.amount, clock);
        let total_rewards = stake_record.pending_rewards + rewards;

        stake_record.last_reward_claim = clock::timestamp_ms(clock);
        stake_record.pending_rewards = 0;

        event::emit(RewardClaimedEvent {
            staker: stake_record.owner,
            reward_amount: total_rewards,
            timestamp: clock::timestamp_ms(clock),
        });

        total_rewards
    }

    /// Calculate pending rewards for a stake
    public fun calculate_rewards(amount: u64, clock: &Clock): u64 {
        // Simplified reward calculation: 5% per year
        let seconds_staked = clock::timestamp_ms(clock) / 1000;
        let annual_reward = (amount * REWARD_RATE) / 100;
        let daily_reward = annual_reward / 365;
        let hours_staked = seconds_staked / 3600;
        (daily_reward / 24) * hours_staked
    }

    // ======================== Governance Functions ========================

    /// Create a new governance proposal
    public fun create_proposal(
        title: String,
        description: String,
        proposal_type: u8,
        stake_record: &StakeRecord,
        clock: &Clock,
        ctx: &mut TxContext,
    ): Proposal {
        // Proposer must have stake to create proposal
        assert!(stake_record.owner == tx_context::sender(ctx), E_NOT_STAKER);
        assert!(stake_record.amount >= MIN_STAKE_AMOUNT, E_INSUFFICIENT_STAKE);

        let created_timestamp = clock::timestamp_ms(clock);
        let voting_period_ms = VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        let voting_end_timestamp = created_timestamp + voting_period_ms;

        let proposal = Proposal {
            id: object::new(ctx),
            proposer: tx_context::sender(ctx),
            title: title.clone(),
            description,
            proposal_type,
            votes_for: 0,
            votes_against: 0,
            created_timestamp,
            voting_end_timestamp,
            execution_timestamp: 0,
            status: 1, // Active
            min_voting_power_required: 1_000_000, // 1M minimum voting power
        };

        event::emit(ProposalCreatedEvent {
            proposal_id: object::id(&proposal),
            proposer: tx_context::sender(ctx),
            title,
            proposal_type,
            voting_end_timestamp,
        });

        proposal
    }

    /// Vote on an active proposal
    public fun vote_on_proposal(
        proposal: &mut Proposal,
        stake_record: &StakeRecord,
        vote: bool,
        clock: &Clock,
        ctx: &mut TxContext,
    ): VoteRecord {
        assert!(proposal.status == 1, E_PROPOSAL_NOT_ACTIVE);
        assert!(
            clock::timestamp_ms(clock) <= proposal.voting_end_timestamp,
            E_PROPOSAL_EXPIRED
        );
        assert!(stake_record.owner == tx_context::sender(ctx), E_NOT_STAKER);

        let voting_power = stake_record.amount;
        assert!(voting_power > 0, E_INVALID_VOTING_POWER);

        // Update proposal vote counts
        if (vote) {
            proposal.votes_for = proposal.votes_for + voting_power;
        } else {
            proposal.votes_against = proposal.votes_against + voting_power;
        };

        let vote_record = VoteRecord {
            id: object::new(ctx),
            voter: tx_context::sender(ctx),
            proposal_id: object::id(proposal),
            vote,
            voting_power,
            vote_timestamp: clock::timestamp_ms(clock),
        };

        event::emit(VoteSubmittedEvent {
            proposal_id: object::id(proposal),
            voter: tx_context::sender(ctx),
            vote,
            voting_power,
        });

        vote_record
    }

    /// Finalize proposal voting and determine outcome
    public fun finalize_proposal(
        proposal: &mut Proposal,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(
            clock::timestamp_ms(clock) > proposal.voting_end_timestamp,
            E_PROPOSAL_NOT_ACTIVE
        );

        let total_votes = proposal.votes_for + proposal.votes_against;
        let quorum_reached = total_votes >= proposal.min_voting_power_required;

        if (quorum_reached && proposal.votes_for > proposal.votes_against) {
            proposal.status = 2; // Passed
            let execution_delay_ms = EXECUTION_DELAY_DAYS * 24 * 60 * 60 * 1000;
            proposal.execution_timestamp = clock::timestamp_ms(clock) + execution_delay_ms;
        } else {
            proposal.status = 3; // Rejected
        };

        event::emit(ProposalExecutedEvent {
            proposal_id: object::id(proposal),
            status: proposal.status,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ======================== View Functions ========================

    /// Get total staked amount
    public fun total_staked(pool: &StakingPool): u64 {
        pool.total_staked
    }

    /// Get stake record details
    public fun get_stake_amount(stake: &StakeRecord): u64 {
        stake.amount
    }

    /// Get stake owner
    public fun get_stake_owner(stake: &StakeRecord): address {
        stake.owner
    }

    /// Get proposal details
    public fun get_proposal_votes(proposal: &Proposal): (u64, u64) {
        (proposal.votes_for, proposal.votes_against)
    }

    /// Get proposal status
    public fun get_proposal_status(proposal: &Proposal): u8 {
        proposal.status
    }

    /// Get governance parameters
    public fun get_taker_fee(params: &GovernanceParams): u16 {
        params.taker_fee_bps
    }

    public fun get_maker_fee(params: &GovernanceParams): u16 {
        params.maker_fee_bps
    }

    public fun get_min_stake(params: &GovernanceParams): u64 {
        params.min_stake_amount
    }

    public fun get_reward_rate(params: &GovernanceParams): u64 {
        params.reward_rate
    }

    // ======================== Admin Functions ========================

    /// Update governance parameters (called by governance)
    public fun update_taker_fee(
        params: &mut GovernanceParams,
        new_fee: u16,
    ) {
        params.taker_fee_bps = new_fee;
    }

    public fun update_maker_fee(
        params: &mut GovernanceParams,
        new_fee: u16,
    ) {
        params.maker_fee_bps = new_fee;
    }

    public fun update_reward_rate(
        params: &mut GovernanceParams,
        new_rate: u64,
    ) {
        params.reward_rate = new_rate;
    }

    /// Add rewards to the pool
    public fun add_rewards(
        pool: &mut StakingPool,
        reward_balance: Balance<sui::sui::SUI>,
    ) {
        balance::join(&mut pool.total_rewards, reward_balance);
    }
}
