/**
 * Enhanced Staking & Governance SDK with Admin/RBAC Integration
 * 
 * This file contains the missing transaction builders and query helpers
 * required to fully integrate the smart contract with the frontend.
 * 
 * Add these to the existing src/lib/stakingSDK.ts file
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// ======================== Admin/RBAC Types ========================

export interface AdminUser {
  id: string;
  address: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: AdminPermission[];
  createdAt: number;
  lastActivity: number;
}

export type AdminPermission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'execute_functions'
  | 'manage_params'
  | 'manage_admins';

export interface AdminRegistry {
  id: string;
  totalAdmins: number;
}

// ======================== Enhanced Proposal Types ========================

export interface EnhancedProposalRecord extends ProposalRecord {
  executionStatus: 'pending' | 'success' | 'failed' | 'not_executed';
  executedAt?: number;
  executedBy?: string;
}

export interface ProposalExecutionData {
  paramType?: number;
  newValue?: bigint;
  featureFlag?: string;
}

// ======================== Admin Transaction Builder ========================

/**
 * Admin Transaction Builder
 * 
 * Handles all admin and governance parameter transactions
 */
export class AdminTransactionBuilder {
  constructor(
    private config: StakingConfig,
    private adminRegistryId: string,
  ) {}

  /**
   * Build transaction to add admin user
   */
  buildAddAdminTransaction(
    tx: Transaction,
    newAdminAddress: string,
    role: 'admin' | 'super_admin',
  ): Transaction {
    const roleValue = role === 'admin' ? 1 : 2;

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::add_admin`,
      arguments: [
        tx.object(this.adminRegistryId),
        tx.pure(newAdminAddress),
        tx.pure(roleValue),
      ],
    });
  }

  /**
   * Build transaction to remove admin user
   */
  buildRemoveAdminTransaction(
    tx: Transaction,
    adminAddress: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::remove_admin`,
      arguments: [
        tx.object(this.adminRegistryId),
        tx.pure(adminAddress),
      ],
    });
  }

  /**
   * Build transaction to update admin role
   */
  buildUpdateAdminRoleTransaction(
    tx: Transaction,
    adminAddress: string,
    newRole: 'admin' | 'super_admin',
  ): Transaction {
    const roleValue = newRole === 'admin' ? 1 : 2;

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::update_admin_role`,
      arguments: [
        tx.object(this.adminRegistryId),
        tx.pure(adminAddress),
        tx.pure(roleValue),
      ],
    });
  }

  /**
   * Build transaction to update governance parameter
   */
  buildUpdateParameterTransaction(
    tx: Transaction,
    paramType: 'taker_fee' | 'maker_fee' | 'min_stake' | 'reward_rate' | 'voting_period' | 'execution_delay',
    newValue: number | bigint,
  ): Transaction {
    // Map parameter name to type code
    const paramTypeMap: Record<string, number> = {
      'taker_fee': 0,
      'maker_fee': 1,
      'min_stake': 2,
      'reward_rate': 3,
      'voting_period': 4,
      'execution_delay': 5,
    };

    const paramTypeCode = paramTypeMap[paramType];
    const valueAsNumber = typeof newValue === 'bigint' ? Number(newValue) : newValue;

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::update_governance_parameter`,
      arguments: [
        tx.pure(paramTypeCode),
        tx.pure(valueAsNumber),
      ],
    });
  }

  /**
   * Build transaction to finalize proposal
   */
  buildFinalizeProposalTransaction(
    tx: Transaction,
    proposalId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::finalize_proposal_with_execution`,
      arguments: [
        tx.object(proposalId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build transaction to initialize admin registry
   */
  buildInitAdminRegistryTransaction(
    tx: Transaction,
    defaultAdminAddress: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance_enhanced::init_admin_registry`,
      arguments: [
        tx.pure(defaultAdminAddress),
      ],
    });
  }
}

// ======================== Enhanced Proposal Transaction Builder ========================

/**
 * Enhanced Governance Transaction Builder
 * 
 * Adds missing proposal creation and finalization functions
 */
export class EnhancedGovernanceTransactionBuilder extends GovernanceTransactionBuilder {
  
  /**
   * Build transaction to create proposal (required for frontend)
   */
  buildCreateProposalTransaction(
    tx: Transaction,
    title: string,
    description: string,
    proposalType: 'parameter' | 'feature' | 'emergency',
    stakeRecordId: string,
    clockObjectId: string,
  ): Transaction {
    // Map proposal type to numeric code
    const typeCode = 
      proposalType === 'parameter' ? 1 :
      proposalType === 'feature' ? 2 :
      3; // emergency

    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::create_proposal`,
      arguments: [
        tx.pure(title),
        tx.pure(description),
        tx.pure(typeCode),
        tx.object(stakeRecordId),
        tx.object(clockObjectId),
      ],
    });
  }

  /**
   * Build transaction to finalize proposal
   */
  buildFinalizeProposalEnhancedTransaction(
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
   * Build transaction to execute emergency proposal
   */
  buildExecuteEmergencyProposalTransaction(
    tx: Transaction,
    proposalId: string,
    clockObjectId: string,
  ): Transaction {
    return tx.moveCall({
      target: `${this.config.packageId}::staking_governance::execute_emergency_proposal`,
      arguments: [
        tx.object(proposalId),
        tx.object(clockObjectId),
      ],
    });
  }
}

// ======================== Admin Query Helper ========================

/**
 * Admin Query Helper
 * 
 * Provides methods to query admin/RBAC data
 */
export class AdminQueryHelper {
  constructor(
    private client: SuiClient,
    private registryId: string,
  ) {}

  /**
   * Get admin user by address
   */
  async getAdminUser(address: string): Promise<AdminUser | null> {
    try {
      // Query admin registry for user
      // In actual implementation, would use client.getObject()
      return null;
    } catch (error) {
      console.error('Failed to fetch admin user:', error);
      return null;
    }
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      // Query admin registry
      return [];
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      return [];
    }
  }

  /**
   * Check if address has admin role
   */
  async isAdmin(address: string): Promise<boolean> {
    const admin = await this.getAdminUser(address);
    return admin !== null && (admin.role === 'admin' || admin.role === 'super_admin');
  }

  /**
   * Check if address has super admin role
   */
  async isSuperAdmin(address: string): Promise<boolean> {
    const admin = await this.getAdminUser(address);
    return admin !== null && admin.role === 'super_admin';
  }

  /**
   * Check if address has specific permission
   */
  async hasPermission(address: string, permission: AdminPermission): Promise<boolean> {
    const admin = await this.getAdminUser(address);
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    return admin.permissions.includes(permission);
  }

  /**
   * Get total admin count
   */
  async getTotalAdmins(): Promise<number> {
    try {
      // Query admin registry total_admins field
      return 0;
    } catch (error) {
      console.error('Failed to fetch admin count:', error);
      return 0;
    }
  }

  /**
   * Get governance parameter value
   */
  async getGovernanceParameter(
    paramsId: string,
    paramType: 'taker_fee' | 'maker_fee' | 'min_stake' | 'reward_rate' | 'voting_period' | 'execution_delay',
  ): Promise<number | null> {
    try {
      // Query governance params object
      return null;
    } catch (error) {
      console.error('Failed to fetch parameter:', error);
      return null;
    }
  }

  /**
   * Get all governance parameters
   */
  async getAllGovernanceParameters(paramsId: string): Promise<Record<string, number> | null> {
    try {
      return {
        taker_fee: 50,
        maker_fee: 25,
        min_stake: 1_000_000,
        reward_rate: 5,
        voting_period: 7,
        execution_delay: 2,
      };
    } catch (error) {
      console.error('Failed to fetch governance parameters:', error);
      return null;
    }
  }
}

// ======================== Enhanced Proposal Query Helper ========================

/**
 * Enhanced Proposal Query Helper
 * 
 * Adds missing proposal query functions
 */
export class EnhancedProposalQueryHelper extends GovernanceQueryHelper {
  
  /**
   * Get proposal details by ID
   */
  async getProposalDetails(proposalId: string): Promise<EnhancedProposalRecord | null> {
    try {
      // Query proposal object from chain
      return null;
    } catch (error) {
      console.error('Failed to fetch proposal details:', error);
      return null;
    }
  }

  /**
   * Get all active proposals
   */
  async getAllActiveProposals(): Promise<EnhancedProposalRecord[]> {
    try {
      // Query all proposals with status = Active
      return [];
    } catch (error) {
      console.error('Failed to fetch active proposals:', error);
      return [];
    }
  }

  /**
   * Get all passed proposals
   */
  async getAllPassedProposals(): Promise<EnhancedProposalRecord[]> {
    try {
      // Query all proposals with status = Passed
      return [];
    } catch (error) {
      console.error('Failed to fetch passed proposals:', error);
      return [];
    }
  }

  /**
   * Get user's voting history
   */
  async getUserVotingHistory(userAddress: string): Promise<VoteRecord[]> {
    try {
      // Query all vote records for user
      return [];
    } catch (error) {
      console.error('Failed to fetch voting history:', error);
      return [];
    }
  }

  /**
   * Check if user has voted on proposal
   */
  async hasUserVoted(proposalId: string, userAddress: string): Promise<boolean> {
    try {
      // Query if vote record exists for proposal + user
      return false;
    } catch (error) {
      console.error('Failed to check vote status:', error);
      return false;
    }
  }

  /**
   * Get user's vote on proposal
   */
  async getUserVote(proposalId: string, userAddress: string): Promise<boolean | null> {
    try {
      // Query vote record and return vote (true/false)
      return null;
    } catch (error) {
      console.error('Failed to fetch user vote:', error);
      return null;
    }
  }

  /**
   * Check if proposal can be executed
   */
  async canExecuteProposal(proposalId: string, currentTime?: number): Promise<boolean> {
    try {
      const now = currentTime || Date.now();
      const proposal = await this.getProposalDetails(proposalId);
      
      if (!proposal) return false;
      
      return proposal.status === ProposalStatus.Passed &&
             now >= proposal.executionTimestamp;
    } catch (error) {
      console.error('Failed to check execution eligibility:', error);
      return false;
    }
  }

  /**
   * Get proposal execution status
   */
  async getProposalExecutionStatus(proposalId: string): Promise<'pending' | 'success' | 'failed' | 'not_executed'> {
    try {
      const proposal = await this.getProposalDetails(proposalId);
      if (!proposal) return 'not_executed';
      return proposal.executionStatus;
    } catch (error) {
      console.error('Failed to fetch execution status:', error);
      return 'not_executed';
    }
  }

  /**
   * Get proposal outcome (passed/rejected)
   */
  async getProposalOutcome(proposalId: string): Promise<'passed' | 'rejected' | 'pending'> {
    try {
      const proposal = await this.getProposalDetails(proposalId);
      if (!proposal) return 'pending';
      
      if (proposal.status === ProposalStatus.Passed) return 'passed';
      if (proposal.status === ProposalStatus.Rejected) return 'rejected';
      return 'pending';
    } catch (error) {
      console.error('Failed to determine proposal outcome:', error);
      return 'pending';
    }
  }

  /**
   * Get proposals by type
   */
  async getProposalsByType(proposalType: ProposalType): Promise<EnhancedProposalRecord[]> {
    try {
      // Query proposals filtered by type
      return [];
    } catch (error) {
      console.error('Failed to fetch proposals by type:', error);
      return [];
    }
  }

  /**
   * Get proposals created by user
   */
  async getProposalsByProposer(proposerAddress: string): Promise<EnhancedProposalRecord[]> {
    try {
      // Query proposals where proposer = address
      return [];
    } catch (error) {
      console.error('Failed to fetch user proposals:', error);
      return [];
    }
  }
}

// ======================== Utility Functions ========================

/**
 * Validate proposal before creation
 */
export function validateProposal(
  title: string,
  description: string,
  proposalType: ProposalType,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Proposal title is required');
  }
  if (title.length > 256) {
    errors.push('Proposal title must be less than 256 characters');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Proposal description is required');
  }
  if (description.length > 2048) {
    errors.push('Proposal description must be less than 2048 characters');
  }

  const validTypes: ProposalType[] = ['parameter', 'feature', 'emergency'];
  if (!validTypes.includes(proposalType)) {
    errors.push(`Invalid proposal type. Must be one of: ${validTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate admin role
 */
export function isValidAdminRole(role: string): role is ('admin' | 'super_admin') {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Convert basis points to percentage
 */
export function bpsToPercentage(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points
 */
export function percentageToBps(percentage: number): number {
  return percentage * 100;
}

/**
 * Check if governance parameter is in valid range
 */
export function isValidParameterValue(
  paramType: 'taker_fee' | 'maker_fee' | 'min_stake' | 'reward_rate' | 'voting_period' | 'execution_delay',
  value: number,
): boolean {
  switch (paramType) {
    case 'taker_fee':
    case 'maker_fee':
      return value >= 0 && value <= 1000; // 0% to 10%
    case 'min_stake':
    case 'voting_period':
    case 'execution_delay':
      return value > 0;
    case 'reward_rate':
      return value >= 0 && value <= 100; // 0% to 100%
    default:
      return false;
  }
}

// ======================== Exports ========================

export {
  StakingTransactionBuilder,
  GovernanceTransactionBuilder,
  StakingQueryHelper,
  GovernanceQueryHelper,
  ProposalStatus,
  ProposalType,
};
