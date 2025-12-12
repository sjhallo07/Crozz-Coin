# Smart Contract & Frontend Integration Checklist

**Status**: ⚠️ CRITICAL GAPS IDENTIFIED & FIXED  
**Date**: December 12, 2025  
**Audience**: Development Team  

---

## Quick Links to Documentation

| Document | Purpose | Time | Location |
|----------|---------|------|----------|
| **SMART_CONTRACT_VALIDATION_ANALYSIS.md** | Complete audit of all gaps | 30 min read | Root folder |
| **SMART_CONTRACT_INTEGRATION_FIX_GUIDE.md** | Step-by-step implementation | Reference | Root folder |
| **staking_governance_enhanced.move** | Enhanced smart contract code | Deploy | `/sui-stack-hello-world/move/token-factory/sources/` |
| **STAKING_SDK_ENHANCED_BUILDERS.ts** | Missing SDK code | Integrate | Root folder |

---

## PART A: CRITICAL BLOCKERS

### ❌ Blocker #1: Sui CLI Not Installed

- **Status**: BLOCKING ALL OPERATIONS
- **Current**: `sui --version` → Not found
- **Fix**: Read SMART_CONTRACT_INTEGRATION_FIX_GUIDE.md → PART 1
- **Estimated Time**: 30 min - 1 hour
- **Verification**:

  ```bash
  sui --version                 # Should return version
  sui client --version          # Should return version
  sui move build --release      # Should build successfully
  ```

- **Blocked Tasks**:
  - Cannot compile smart contracts
  - Cannot deploy to testnet
  - Cannot test smart contract functions

---

### ❌ Blocker #2: Missing Smart Contract Functions

- **Status**: INCOMPLETE IMPLEMENTATION
- **Files Affected**: `staking_governance.move`
- **Missing**:
  - Admin/RBAC system (0% implemented)
  - Proposal execution logic (50% implemented)
  - Data query functions (0% implemented)
  - Parameter update system (0% implemented)
- **Solution**: Deploy `staking_governance_enhanced.move`
- **Estimated Time**: 2 hours
- **Verification**:

  ```bash
  sui move build --release      # No errors
  # Check that both modules compile
  ```

- **Blocked Tasks**:
  - Cannot execute proposals
  - Cannot manage admins
  - Cannot enforce permissions
  - Cannot query chain data

---

### ❌ Blocker #3: SDK Missing 50% of Functions

- **Status**: PARTIAL IMPLEMENTATION
- **Current**: Staking builders only
- **Missing**:
  - AdminTransactionBuilder (6 methods)
  - ProposalCreationTransaction (1 method)
  - AdminQueryHelper (8 methods)
  - ProposalQueryHelper (10 methods)
- **Solution**: Integrate STAKING_SDK_ENHANCED_BUILDERS.ts
- **Estimated Time**: 2-3 hours
- **Verification**:

  ```bash
  npm run build                 # TypeScript compilation
  grep -r "buildAddAdminTransaction" src/  # Verify functions exist
  ```

- **Blocked Tasks**:
  - Cannot create proposals via SDK
  - Cannot manage admins
  - Cannot query proposal data
  - Cannot check permissions

---

### ❌ Blocker #4: Frontend Not Connected to Contract

- **Status**: PLACEHOLDER ONLY
- **Current State**:
  - Proposals are hardcoded
  - Functions don't call contract
  - No reward claiming integration
  - No admin UI
- **Impact**: App looks like it works but nothing persists
- **Solution**: Follow SMART_CONTRACT_INTEGRATION_FIX_GUIDE.md → PART 4
- **Estimated Time**: 6-8 hours
- **Verification**:

  ```bash
  npm run dev                   # App starts
  # Test: Create proposal - should call contract
  # Test: Vote - should persist on chain
  # Test: Claim rewards - should transfer tokens
  ```

- **Blocked Tasks**:
  - Cannot save user data
  - Cannot execute transactions
  - Cannot enforce permissions
  - Cannot distribute rewards

---

## PART B: IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Day 1) - 4-6 hours

#### Step 1.1: Install & Verify Sui CLI ⏱️ 30 min - 1 hour

- [ ] Read SMART_CONTRACT_INTEGRATION_FIX_GUIDE.md PART 1
- [ ] Execute Sui CLI installation command

  ```bash
  # Option A: From source
  curl --proto '=https' --tlsv1.2 -sSf https://sh.suiup.sh | sh
  source ~/.suiup/env
  
  # Option B: Check GitHub releases for binary
  # Option C: Use Docker
  ```

- [ ] Verify installation

  ```bash
  sui --version           # Should show version number
  sui client --version    # Should show version number
  sui move --version      # Should show version number
  ```

- [ ] Document version numbers for team

#### Step 1.2: Build Smart Contracts ⏱️ 30 min

- [ ] Navigate to contract directory

  ```bash
  cd sui-stack-hello-world/move/token-factory
  ```

- [ ] Build both modules

  ```bash
  sui move build --release
  ```

- [ ] Verify no errors in output
- [ ] Check both modules compile:
  - [ ] staking_governance.move ✓
  - [ ] staking_governance_enhanced.move ✓
- [ ] Document any warnings or errors

#### Step 1.3: Merge SDK Files ⏱️ 2 hours

- [ ] Open STAKING_SDK_ENHANCED_BUILDERS.ts
- [ ] Copy all class definitions:
  - [ ] AdminTransactionBuilder (6 methods)
  - [ ] EnhancedGovernanceTransactionBuilder (3 methods)
  - [ ] AdminQueryHelper (8 methods)
  - [ ] EnhancedProposalQueryHelper (10 methods)
- [ ] Add to src/lib/stakingSDK.ts
- [ ] Add all TypeScript interfaces:
  - [ ] AdminUser
  - [ ] AdminPermission
  - [ ] AdminRegistry
  - [ ] EnhancedProposalRecord
  - [ ] ProposalExecutionData
- [ ] Add all utility functions:
  - [ ] validateProposal()
  - [ ] isValidAdminRole()
  - [ ] bpsToPercentage()
  - [ ] percentageToBps()
  - [ ] isValidParameterValue()
- [ ] Update exports to include all new classes
- [ ] Verify TypeScript compilation

  ```bash
  npm run build
  ```

- [ ] Fix any type errors

#### Step 1.4: Update SDK Configuration ⏱️ 30 min

- [ ] After publishing to testnet, get:
  - [ ] Package ID from deployment output
  - [ ] Pool Object ID
  - [ ] Admin Registry ID
  - [ ] Clock Object ID
- [ ] Update src/lib/stakingSDK.ts:

  ```typescript
  export const STAKING_CONFIG: StakingConfig = {
    packageId: '0x...', // From publish
    poolAddress: '0x...', // From publish
    minStakeAmount: BigInt(1_000_000),
    rewardRate: 5,
  };
  
  export const ADMIN_REGISTRY_ID = '0x...'; // From publish
  export const CLOCK_ID = '0x0000...'; // Sui clock object
  ```

---

### Phase 2: Frontend Integration (Day 2) - 6-8 hours

#### Step 2.1: Add Proposal Creation Feature ⏱️ 2 hours

- [ ] Create ProposalCreationModal component

  ```bash
  touch src/components/ProposalCreationModal.tsx
  ```

- [ ] Implement form with fields:
  - [ ] Title input
  - [ ] Description textarea
  - [ ] Type selector (parameter/feature/emergency)
- [ ] Implement submit handler:

  ```typescript
  const handleSubmit = async (data) => {
    const govBuilder = new EnhancedGovernanceTransactionBuilder(STAKING_CONFIG);
    let tx = new Transaction();
    tx = govBuilder.buildCreateProposalTransaction(...);
    await signAndExecute({ transaction: tx });
  };
  ```

- [ ] Add to StakingGovernance.tsx

  ```typescript
  {canCreateProposal && (
    <button onClick={() => setShowCreateModal(true)}>
      Create Proposal
    </button>
  )}
  {showCreateModal && (
    <ProposalCreationModal
      onSubmit={handleCreateProposal}
      onClose={() => setShowCreateModal(false)}
    />
  )}
  ```

#### Step 2.2: Replace Hardcoded Proposals ⏱️ 1 hour

- [ ] Remove hardcoded proposals from StakingGovernance.tsx

  ```typescript
  // DELETE:
  // setProposals([
  //   { id: '1', title: 'Increase Staking Reward Rate', ... },
  //   { id: '2', title: 'Add New Trading Pair', ... },
  // ]);
  ```

- [ ] Add contract query on component mount:

  ```typescript
  useEffect(() => {
    const fetchProposals = async () => {
      const helper = new EnhancedProposalQueryHelper(client);
      const active = await helper.getAllActiveProposals();
      setProposals(active);
    };
    fetchProposals();
  }, []);
  ```

- [ ] Verify proposals load from contract
- [ ] Test filters (active/passed/rejected)

#### Step 2.3: Integrate Vote Submission ⏱️ 1 hour

- [ ] Update handleVote() function:

  ```typescript
  const handleVote = async (proposalId: string, voteFor: boolean) => {
    const govBuilder = new EnhancedGovernanceTransactionBuilder(STAKING_CONFIG);
    let tx = new Transaction();
    tx = govBuilder.buildVoteTransaction(
      tx,
      proposalId,
      userStakeRecordId,
      voteFor,
      CLOCK_ID,
    );
    const result = await signAndExecute({ transaction: tx });
    // Refresh proposals
    const helper = new EnhancedProposalQueryHelper(client);
    const updated = await helper.getAllActiveProposals();
    setProposals(updated);
  };
  ```

- [ ] Test voting on testnet
- [ ] Verify votes update proposal counts

#### Step 2.4: Integrate Reward Claiming ⏱️ 1 hour

- [ ] Update handleClaimRewards() function:

  ```typescript
  const handleClaimRewards = async () => {
    const stakeBuilder = new StakingTransactionBuilder(STAKING_CONFIG);
    let tx = new Transaction();
    tx = stakeBuilder.buildClaimRewardsTransaction(
      tx,
      userStakeRecordId,
      CLOCK_ID,
    );
    const result = await signAndExecute({ transaction: tx });
    // Update UI
    const rewards = await queryHelper.getUserRewards(userAddress);
    setTotalRewards(rewards);
  };
  ```

- [ ] Test on testnet
- [ ] Verify tokens transferred

#### Step 2.5: Add Admin Functions ⏱️ 2 hours

- [ ] Create AdminParametersPanel component

  ```bash
  touch src/components/AdminParametersPanel.tsx
  ```

- [ ] Implement parameter update form:
  - [ ] Taker fee input
  - [ ] Maker fee input
  - [ ] Min stake input
  - [ ] Reward rate input
  - [ ] Voting period input
  - [ ] Execution delay input
- [ ] Implement submit handler:

  ```typescript
  const handleUpdateParameter = async (paramType, newValue) => {
    const adminBuilder = new AdminTransactionBuilder(STAKING_CONFIG, ADMIN_REGISTRY_ID);
    let tx = new Transaction();
    tx = adminBuilder.buildUpdateParameterTransaction(tx, paramType, newValue);
    await signAndExecute({ transaction: tx });
  };
  ```

- [ ] Add permission check:

  ```typescript
  const canUpdateParams = await adminHelper.hasPermission(
    userAddress,
    'manage_params',
  );
  ```

- [ ] Only show if admin

#### Step 2.6: Add Permission Enforcement ⏱️ 1 hour

- [ ] Create usePermissions hook:

  ```bash
  touch src/hooks/usePermissions.ts
  ```

- [ ] Implement permission checks:

  ```typescript
  export const useStakingPermissions = (userAddress: string) => {
    const [perms, setPerms] = useState({
      canStake: true,
      canVote: true,
      canCreateProposal: true,
      canManageAdmins: false,
      canUpdateParameters: false,
    });
    
    useEffect(() => {
      const check = async () => {
        const helper = new AdminQueryHelper(client, ADMIN_REGISTRY_ID);
        const isAdmin = await helper.isAdmin(userAddress);
        setPerms(prev => ({
          ...prev,
          canManageAdmins: isAdmin,
          canUpdateParameters: isAdmin,
        }));
      };
      check();
    }, [userAddress]);
    
    return perms;
  };
  ```

- [ ] Use hook in components:

  ```typescript
  const { canCreateProposal, canManageAdmins } = useStakingPermissions(address);
  ```

- [ ] Disable UI elements based on permissions
- [ ] Show permission error messages

---

### Phase 3: Testing (Day 3) - 4-6 hours

#### Step 3.1: Move Unit Tests ⏱️ 2 hours

- [ ] Create test file:

  ```bash
  touch sui-stack-hello-world/move/token-factory/tests/staking_tests.move
  ```

- [ ] Write tests for:
  - [ ] Stake function
  - [ ] Unstake function
  - [ ] Claim rewards function
  - [ ] Create proposal function
  - [ ] Vote function
  - [ ] Admin functions
  - [ ] Permission checks
- [ ] Run tests:

  ```bash
  sui move test --release
  ```

- [ ] All tests must pass

#### Step 3.2: Frontend Integration Tests ⏱️ 2 hours

- [ ] Create test file:

  ```bash
  touch src/__tests__/StakingIntegration.test.tsx
  ```

- [ ] Test critical flows:
  - [ ] Stake CROZ
  - [ ] Create proposal
  - [ ] Vote on proposal
  - [ ] Claim rewards
  - [ ] Update parameters (admin)
- [ ] Verify contract calls work
- [ ] Check error handling

#### Step 3.3: Testnet Deployment ⏱️ 2 hours

- [ ] Publish contracts to testnet:

  ```bash
  cd sui-stack-hello-world/move/token-factory
  sui client publish --network testnet --gas-budget 200000000
  ```

- [ ] Save all object IDs:
  - [ ] Package ID
  - [ ] Pool object ID
  - [ ] Admin registry ID
- [ ] Update SDK config with real IDs
- [ ] Request testnet SUI tokens
- [ ] Test all flows on testnet:
  - [ ] Can stake
  - [ ] Can create proposal
  - [ ] Can vote
  - [ ] Can claim rewards
  - [ ] Tokens transfer correctly
  - [ ] Events emit correctly

#### Step 3.4: Admin Functions Test ⏱️ 1 hour

- [ ] Test admin functions:
  - [ ] Add admin user ✓
  - [ ] Remove admin user ✓
  - [ ] Update admin role ✓
  - [ ] Update parameters ✓
  - [ ] Permission checks ✓
- [ ] Verify non-admins can't:
  - [ ] Add admins ✓
  - [ ] Update parameters ✓
  - [ ] Remove other admins ✓

---

### Phase 4: Polish & Optimization (Day 4) - 3-4 hours

#### Step 4.1: Error Handling ⏱️ 1 hour

- [ ] Add error messages for all smart contract errors
- [ ] Map error codes to user messages:
  - [ ] E_INVALID_STAKE_AMOUNT
  - [ ] E_INSUFFICIENT_STAKE
  - [ ] E_INVALID_PROPOSAL_ID
  - [ ] E_NOT_STAKER
  - [ ] E_ALREADY_VOTED
  - [ ] etc.
- [ ] Display errors in UI
- [ ] Add retry logic for failures

#### Step 4.2: Loading States ⏱️ 1 hour

- [ ] Add loading indicators for:
  - [ ] Staking transactions
  - [ ] Proposal creation
  - [ ] Voting
  - [ ] Reward claiming
  - [ ] Parameter updates
- [ ] Disable buttons while loading
- [ ] Show transaction status

#### Step 4.3: Input Validation ⏱️ 1 hour

- [ ] Validate stake amounts:
  - [ ] >= minimum stake amount
  - [ ] Valid number format
  - [ ] User has enough balance
- [ ] Validate proposal fields:
  - [ ] Title not empty, < 256 chars
  - [ ] Description not empty, < 2048 chars
  - [ ] Type is valid (parameter/feature/emergency)
- [ ] Validate parameters:
  - [ ] Fee % between 0-10%
  - [ ] Min stake > 0
  - [ ] APY 0-100%
  - [ ] Days > 0

#### Step 4.4: Documentation Updates ⏱️ 1 hour

- [ ] Update README with new features
- [ ] Document API changes
- [ ] Add code comments for complex logic
- [ ] Create user guide for staking UI
- [ ] Create admin guide for parameter updates

---

### Phase 5: Mainnet Preparation (Day 5) - 2-3 hours

#### Step 5.1: Security Review ⏱️ 1 hour

- [ ] Review smart contract code
- [ ] Check for vulnerabilities
- [ ] Verify permissions enforced
- [ ] Check math operations for overflow
- [ ] Review event emissions

#### Step 5.2: Final Testing ⏱️ 1 hour

- [ ] Full regression test suite
- [ ] Edge case testing
- [ ] Performance testing
- [ ] Gas usage profiling
- [ ] Security review completion

#### Step 5.3: Team Review & Approval ⏱️ 30 min

- [ ] Code review by team lead
- [ ] Security review completion
- [ ] QA approval
- [ ] Team sign-off

#### Step 5.4: Mainnet Deployment ⏱️ 30 min

- [ ] Deploy to mainnet:

  ```bash
  sui client publish --network mainnet --gas-budget 300000000
  ```

- [ ] Verify deployment
- [ ] Update configuration
- [ ] Announce to community

---

## PART C: VERIFICATION CHECKLIST

### Smart Contract Verification

- [ ] Both Move modules compile without errors
- [ ] All functions are callable via Sui CLI
- [ ] Events emit with correct data
- [ ] Error codes return appropriate messages
- [ ] Admin functions enforce permissions
- [ ] Proposal execution updates parameters
- [ ] Rewards calculate correctly
- [ ] Gas usage is acceptable

### SDK Verification

- [ ] All transaction builders work
- [ ] All query helpers return data
- [ ] TypeScript compilation succeeds
- [ ] No type errors
- [ ] Exports are correct
- [ ] Validation functions work
- [ ] Error handling works

### Frontend Verification

- [ ] Proposals load from contract (not hardcoded)
- [ ] Users can create proposals
- [ ] Users can vote on proposals
- [ ] Votes update proposal counts
- [ ] Users can claim rewards
- [ ] Tokens transfer correctly
- [ ] Admins can update parameters
- [ ] Permissions are enforced
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Input validation works

### Testnet Verification

- [ ] Contract deploys successfully
- [ ] All functions work on testnet
- [ ] Frontend connects to contract
- [ ] Transactions execute successfully
- [ ] Data persists on-chain
- [ ] Events emit to testnet
- [ ] No unexpected errors

---

## PART D: REFERENCE DOCUMENTS

### Must Read (In Order)

1. **SMART_CONTRACT_VALIDATION_ANALYSIS.md** - Understand the gaps
2. **SMART_CONTRACT_INTEGRATION_FIX_GUIDE.md** - Implement the fixes
3. **This Checklist** - Track your progress

### Reference Files

- **staking_governance_enhanced.move** - Enhanced smart contract
- **STAKING_SDK_ENHANCED_BUILDERS.ts** - Enhanced SDK code
- **Existing staking_governance.move** - Original contract
- **Existing stakingSDK.ts** - Original SDK

---

## Summary

**Total Estimated Time**: 19-31 hours (3-4 days focused development)

**Critical Path**:

1. Install Sui CLI (1 hour) - BLOCKING
2. Build contracts (30 min) - BLOCKING
3. Integrate SDK (2-3 hours) - BLOCKING
4. Implement frontend (6-8 hours)
5. Test on testnet (4-6 hours)
6. Deploy to mainnet (2-3 hours)

**Success Criteria**:

- ✅ Sui CLI installed and working
- ✅ Both smart contracts compile
- ✅ All SDK functions working
- ✅ Frontend integrated with contract
- ✅ All tests passing on testnet
- ✅ Admin functions working
- ✅ Permissions enforced
- ✅ Ready for mainnet deployment

**Next Step**: Begin Phase 1, Step 1.1 - Install Sui CLI
