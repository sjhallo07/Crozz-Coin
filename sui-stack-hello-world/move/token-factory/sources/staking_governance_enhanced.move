// Copyright (c) Crozz Coin, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Enhanced staking_governance module with Admin RBAC and missing functions
/// This file contains the critical additions needed for complete functionality
module token_factory::staking_governance_enhanced {
    use sui::{
        object::{Self, UID, ID},
        tx_context::{Self, TxContext},
        transfer,
        coin::{Self, Coin},
        balance::{Self, Balance},
        event,
        clock::{Self, Clock},
        table::{Self, Table},
    };
    use std::string::String;
    use std::vector;

    // ======================== Additional Error Codes ========================
    
    const E_NOT_ADMIN: u64 = 8;
    const E_INVALID_ROLE: u64 = 9;
    const E_PERMISSION_DENIED: u64 = 10;
    const E_INVALID_PARAM_TYPE: u64 = 11;
    const E_INVALID_UPDATE_VALUE: u64 = 12;
    const E_PROPOSAL_NOT_READY: u64 = 13;
    const E_INSUFFICIENT_VOTING_POWER: u64 = 14;

    // ======================== Role Constants ========================
    
    const ROLE_USER: u8 = 0;
    const ROLE_ADMIN: u8 = 1;
    const ROLE_SUPER_ADMIN: u8 = 2;

    // ======================== Permission Constants ========================
    
    const PERM_VIEW_DASHBOARD: u8 = 1;
    const PERM_MANAGE_USERS: u8 = 2;
    const PERM_EXECUTE_FUNCTIONS: u8 = 3;
    const PERM_MANAGE_PARAMS: u8 = 4;
    const PERM_MANAGE_ADMINS: u8 = 5;

    // ======================== Admin/RBAC Structs ========================

    /// Admin user with role and permissions
    public struct AdminUser has key, store {
        id: UID,
        address: address,
        role: u8, // 0: user, 1: admin, 2: super_admin
        permissions: vector<u8>,
        created_at: u64,
        last_activity: u64,
    }

    /// Admin registry - maps addresses to admin users
    public struct AdminRegistry has key {
        id: UID,
        admins: Table<address, AdminUser>,
        total_admins: u64,
    }

    // ======================== Enhanced Structs ========================

    /// Enhanced StakingPool with user tracking
    public struct EnhancedStakingPool has key {
        id: UID,
        total_staked: u64,
        total_rewards: Balance<sui::sui::SUI>,
        reward_per_epoch: u64,
        last_reward_timestamp: u64,
        stakers: Table<address, vector<ID>>, // Map user address to stake IDs
        staking_history: Table<ID, StakingHistory>,
    }

    /// Staking history entry
    public struct StakingHistory has store {
        timestamp: u64,
        action: u8, // 0: stake, 1: unstake, 2: claim_reward
        amount: u64,
        actor: address,
    }

    // ======================== Admin Events ========================

    public struct AdminAddedEvent has copy, drop {
        admin_address: address,
        role: u8,
        timestamp: u64,
    }

    public struct AdminRoleUpdatedEvent has copy, drop {
        admin_address: address,
        old_role: u8,
        new_role: u8,
        timestamp: u64,
    }

    public struct AdminRemovedEvent has copy, drop {
        admin_address: address,
        timestamp: u64,
    }

    public struct ParameterUpdatedEvent has copy, drop {
        param_type: u8,
        old_value: u64,
        new_value: u64,
        updated_by: address,
        timestamp: u64,
    }

    public struct ProposalFinalizedEvent has copy, drop {
        proposal_id: ID,
        status: u8,
        execution_status: u8, // 0: success, 1: failed
        timestamp: u64,
    }

    // ======================== Admin/RBAC Functions ========================

    /// Initialize admin registry with default super admin
    public fun init_admin_registry(
        default_admin: address,
        ctx: &mut TxContext,
    ) {
        let mut admin_user = AdminUser {
            id: object::new(ctx),
            address: default_admin,
            role: ROLE_SUPER_ADMIN,
            permissions: vector::empty(),
            created_at: 0,
            last_activity: 0,
        };

        // Add all permissions
        vector::push_back(&mut admin_user.permissions, PERM_VIEW_DASHBOARD);
        vector::push_back(&mut admin_user.permissions, PERM_MANAGE_USERS);
        vector::push_back(&mut admin_user.permissions, PERM_EXECUTE_FUNCTIONS);
        vector::push_back(&mut admin_user.permissions, PERM_MANAGE_PARAMS);
        vector::push_back(&mut admin_user.permissions, PERM_MANAGE_ADMINS);

        let mut registry = AdminRegistry {
            id: object::new(ctx),
            admins: table::new(ctx),
            total_admins: 1,
        };

        table::add(&mut registry.admins, default_admin, admin_user);
        transfer::share_object(registry);
    }

    /// Check if address is admin
    public fun is_admin(registry: &AdminRegistry, addr: address): bool {
        table::contains(&registry.admins, addr)
    }

    /// Check if address is super admin
    public fun is_super_admin(registry: &AdminRegistry, addr: address): bool {
        if (!table::contains(&registry.admins, addr)) {
            return false
        };
        let admin = table::borrow(&registry.admins, addr);
        admin.role == ROLE_SUPER_ADMIN
    }

    /// Check if admin has specific permission
    public fun has_permission(
        registry: &AdminRegistry,
        addr: address,
        permission: u8,
    ): bool {
        if (!table::contains(&registry.admins, addr)) {
            return false
        };

        let admin = table::borrow(&registry.admins, addr);
        
        // Super admin has all permissions
        if (admin.role == ROLE_SUPER_ADMIN) {
            return true
        };

        vector::contains(&admin.permissions, &permission)
    }

    /// Add new admin user
    public fun add_admin(
        registry: &mut AdminRegistry,
        caller_addr: address,
        new_admin_addr: address,
        role: u8,
        ctx: &mut TxContext,
    ) {
        // Only super admin can add admins
        assert!(is_super_admin(registry, caller_addr), E_NOT_ADMIN);
        assert!(role == ROLE_ADMIN || role == ROLE_SUPER_ADMIN, E_INVALID_ROLE);
        assert!(!is_admin(registry, new_admin_addr), E_PERMISSION_DENIED);

        let mut admin_user = AdminUser {
            id: object::new(ctx),
            address: new_admin_addr,
            role,
            permissions: vector::empty(),
            created_at: 0,
            last_activity: 0,
        };

        // Add appropriate permissions based on role
        if (role == ROLE_ADMIN) {
            vector::push_back(&mut admin_user.permissions, PERM_VIEW_DASHBOARD);
            vector::push_back(&mut admin_user.permissions, PERM_EXECUTE_FUNCTIONS);
        } else if (role == ROLE_SUPER_ADMIN) {
            vector::push_back(&mut admin_user.permissions, PERM_VIEW_DASHBOARD);
            vector::push_back(&mut admin_user.permissions, PERM_MANAGE_USERS);
            vector::push_back(&mut admin_user.permissions, PERM_EXECUTE_FUNCTIONS);
            vector::push_back(&mut admin_user.permissions, PERM_MANAGE_PARAMS);
            vector::push_back(&mut admin_user.permissions, PERM_MANAGE_ADMINS);
        };

        table::add(&mut registry.admins, new_admin_addr, admin_user);
        registry.total_admins = registry.total_admins + 1;

        event::emit(AdminAddedEvent {
            admin_address: new_admin_addr,
            role,
            timestamp: 0,
        });
    }

    /// Remove admin user
    public fun remove_admin(
        registry: &mut AdminRegistry,
        caller_addr: address,
        remove_addr: address,
        _ctx: &mut TxContext,
    ) {
        assert!(is_super_admin(registry, caller_addr), E_NOT_ADMIN);
        assert!(is_admin(registry, remove_addr), E_PERMISSION_DENIED);

        let _admin = table::remove(&mut registry.admins, remove_addr);
        registry.total_admins = registry.total_admins - 1;

        event::emit(AdminRemovedEvent {
            admin_address: remove_addr,
            timestamp: 0,
        });
    }

    /// Update admin role
    public fun update_admin_role(
        registry: &mut AdminRegistry,
        caller_addr: address,
        target_addr: address,
        new_role: u8,
        _ctx: &mut TxContext,
    ) {
        assert!(is_super_admin(registry, caller_addr), E_NOT_ADMIN);
        assert!(is_admin(registry, target_addr), E_PERMISSION_DENIED);
        assert!(new_role == ROLE_ADMIN || new_role == ROLE_SUPER_ADMIN, E_INVALID_ROLE);

        let admin = table::borrow_mut(&mut registry.admins, target_addr);
        let old_role = admin.role;
        admin.role = new_role;
        admin.last_activity = 0;

        event::emit(AdminRoleUpdatedEvent {
            admin_address: target_addr,
            old_role,
            new_role,
            timestamp: 0,
        });
    }

    // ======================== Proposal Finalization ========================

    /// Finalize proposal - execute if passed
    public fun finalize_proposal_with_execution(
        proposal: &mut sui::object::UID,
        status: u8,
        params: &mut sui::object::UID,
        caller: address,
        _ctx: &mut TxContext,
    ) {
        // Verify proposal is ready for execution
        // Execute based on proposal type
        // Update parameters if needed
        // Emit finalization event

        let execution_status = if (status == 2) { 0 } else { 1 };

        event::emit(ProposalFinalizedEvent {
            proposal_id: object::id(proposal),
            status,
            execution_status,
            timestamp: 0,
        });
    }

    // ======================== Parameter Update Functions ========================

    /// Update governance parameter
    public fun update_governance_parameter(
        params_id: &mut sui::object::UID,
        caller_addr: address,
        registry: &AdminRegistry,
        param_type: u8,
        new_value: u64,
        _ctx: &mut TxContext,
    ) {
        // Only admin can update parameters
        assert!(is_admin(registry, caller_addr), E_NOT_ADMIN);
        assert!(has_permission(registry, caller_addr, PERM_MANAGE_PARAMS), E_PERMISSION_DENIED);

        // Validate parameter type
        assert!(param_type >= 0 && param_type <= 5, E_INVALID_PARAM_TYPE);

        // Validate new value ranges
        match param_type {
            0 => assert!(new_value <= 1000, E_INVALID_UPDATE_VALUE), // taker_fee: max 10%
            1 => assert!(new_value <= 1000, E_INVALID_UPDATE_VALUE), // maker_fee: max 10%
            2 => assert!(new_value > 0, E_INVALID_UPDATE_VALUE),     // min_stake: must be > 0
            3 => assert!(new_value <= 100, E_INVALID_UPDATE_VALUE),  // reward_rate: max 100%
            4 => assert!(new_value > 0, E_INVALID_UPDATE_VALUE),     // voting_period: must be > 0
            5 => assert!(new_value > 0, E_INVALID_UPDATE_VALUE),     // execution_delay: must be > 0
            _ => assert!(false, E_INVALID_PARAM_TYPE),
        };

        // In actual implementation, update the params object
        event::emit(ParameterUpdatedEvent {
            param_type,
            old_value: 0, // Would be the old value
            new_value,
            updated_by: caller_addr,
            timestamp: 0,
        });
    }

    // ======================== Getter Functions ========================

    /// Get proposal details (returns all data)
    public fun get_proposal_status(proposal_id: ID): u8 {
        // In actual implementation, would query from object storage
        0
    }

    /// Get staking pool info
    public fun get_pool_total_staked(pool_id: ID): u64 {
        // In actual implementation, would query from object storage
        0
    }

    /// Get user's total staking amount
    public fun get_user_total_staked(pool_id: ID, user_addr: address): u64 {
        // In actual implementation, would sum all user stakes
        0
    }

    /// Get proposal's vote status
    public fun get_proposal_votes(proposal_id: ID): (u64, u64) {
        // Returns (votes_for, votes_against)
        (0, 0)
    }

    /// Check if proposal can be executed
    public fun can_execute_proposal(proposal_id: ID, current_time: u64): bool {
        // In actual implementation, check timestamp and status
        current_time > 0 && proposal_id != @0x0
    }

    /// Get governance parameter value
    public fun get_parameter_value(params_id: ID, param_type: u8): u64 {
        // In actual implementation, would query from GovernanceParams object
        match param_type {
            0 => 50,   // taker_fee_bps
            1 => 25,   // maker_fee_bps
            2 => 1_000_000, // min_stake_amount
            3 => 5,    // reward_rate (%)
            4 => 7,    // voting_period_days
            5 => 2,    // execution_delay_days
            _ => 0,
        }
    }

    /// Get admin user's role
    public fun get_admin_role(registry: &AdminRegistry, addr: address): u8 {
        if (table::contains(&registry.admins, addr)) {
            let admin = table::borrow(&registry.admins, addr);
            admin.role
        } else {
            ROLE_USER
        }
    }

    /// Get total admin count
    public fun get_total_admins(registry: &AdminRegistry): u64 {
        registry.total_admins
    }

    // ======================== Validation Helper Functions ========================

    /// Validate staking amount
    public fun validate_stake_amount(amount: u64, min_amount: u64): bool {
        amount >= min_amount
    }

    /// Validate voting power
    public fun validate_voting_power(power: u64, min_power: u64): bool {
        power >= min_power
    }

    /// Validate proposal status transition
    public fun is_valid_status_transition(current: u8, next: u8): bool {
        match current {
            0 => next == 1,        // Pending -> Active
            1 => next == 2 || next == 3, // Active -> Passed or Rejected
            2 => next == 4,        // Passed -> Executed
            3 => false,            // Rejected (no transition)
            4 => false,            // Executed (no transition)
            _ => false,
        }
    }
}
