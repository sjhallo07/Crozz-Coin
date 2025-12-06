# Ethereum → Sui: Complete Migration Checklist

**Project Name:** _________________  
**Start Date:** _________________  
**Target Mainnet Date:** _________________

---

## PHASE 0: PRE-MIGRATION PLANNING

### 0.1 Analyze Your Contracts

- [ ] List all Solidity contracts
- [ ] Document each contract's purpose
- [ ] Identify state variables per contract
- [ ] Identify public functions per contract
- [ ] Identify access control patterns used
- [ ] Document external dependencies
- [ ] Identify upgrade mechanisms (if any)
- [ ] Document event emissions
- [ ] Calculate contract code complexity (LOC, functions, interactions)

**Summary:**
- Total contracts: _____
- Total LOC: _____
- Most complex contract: _________________
- Estimated complexity level: ☐ Low ☐ Medium ☐ High ☐ Very High

### 0.2 Design New Architecture

- [ ] Plan module structure (one per contract? fewer?)
- [ ] Identify shared objects vs owned objects
- [ ] Plan capability objects for access control
- [ ] Identify objects that will be traded/transferred
- [ ] Plan for versioning/upgrades
- [ ] Create architectural diagrams
- [ ] Plan client-side PTBs for composition
- [ ] Document data migrations (if upgrade)

**Architecture Approved By:** _________________  
**Date:** _________________

---

## PHASE 1: ENVIRONMENT SETUP

### 1.1 Install Tools

- [ ] Install Sui CLI: `brew install sui` or build from source
- [ ] Verify install: `sui --version`
- [ ] Install VSCode
- [ ] Install VSCode Move extension (mysten.move)
- [ ] Install TypeScript and npm
- [ ] Install @mysten/sui.js: `npm install @mysten/sui.js`
- [ ] Install Sui TypeScript SDK: `npm install --save-dev @mysten/sui.sdk`

**Tools Installed By:** _________________  
**Date:** _________________

### 1.2 Create Project Structure

```bash
sui move new my_project
cd my_project
```

- [ ] Project created
- [ ] Move.toml reviewed
- [ ] Dependencies configured
- [ ] Directory structure reviewed:
  - [ ] `sources/` exists
  - [ ] `tests/` exists
  - [ ] `Move.toml` exists

**Project Created By:** _________________  
**Date:** _________________

### 1.3 Configure Networks

- [ ] Set up devnet connection
- [ ] Set up testnet connection
- [ ] Set up mainnet connection (don't publish yet!)
- [ ] Create wallets for each network
- [ ] Request testnet SUI: https://testnet-faucet.sui.io
- [ ] Request devnet SUI: `sui client faucet --url=https://fullnode.devnet.sui.io:443`
- [ ] Verify wallet balances

**Network Configuration Complete By:** _________________  
**Date:** _________________

---

## PHASE 2: CONTRACT MIGRATION

### 2.1 Data Model Migration

For each contract, complete:

#### Contract: _________________

- [ ] Analyze state variables
- [ ] Create structs for each piece of state
- [ ] Add `id: UID` to structs that will be stored
- [ ] Add `key` ability to stored structs
- [ ] Add `store` ability where needed
- [ ] Convert mappings to separate objects or dynamic fields
- [ ] Document ownership model (owned vs shared vs immutable)
- [ ] Create factory functions for object creation

**Data Model Completed For:** _________________  
**Date:** _________________  
**Reviewer:** _________________

### 2.2 Function Migration

For each function in contract, complete:

#### Function: _________________

- [ ] Identify function type (state read, state write, creation, destruction)
- [ ] Remove `msg.sender` checks (object ownership replaces these)
- [ ] Add `ctx: &mut TxContext` parameter if needed
- [ ] Change `require()` to `assert!()`
- [ ] Change `revert()` to `abort`
- [ ] Add `entry` keyword if meant to be called from client
- [ ] Add `public` keyword if meant to be called from other modules
- [ ] Check for state mutations (use `&mut` for modifiable parameters)
- [ ] Implement proper error handling with error codes
- [ ] Add documentation comments

**Functions Migrated For:** _________________  
**Date:** _________________  
**Count:** _____ functions

### 2.3 Access Control Migration

- [ ] Identify all access control patterns used
- [ ] For each `Ownable` pattern:
  - [ ] Create `AdminCap` struct with `key` ability
  - [ ] Create function to grant admin cap
  - [ ] Replace `onlyOwner` checks with `&AdminCap` parameter
  - [ ] Remove `msg.sender` checks
  
- [ ] For each `AccessControl` role:
  - [ ] Create role capability structs
  - [ ] Create grant/revoke functions
  - [ ] Update protected functions to take capability

**Access Control Migrated For:** _________________  
**Date:** _________________

### 2.4 State Transitions

- [ ] Verify constructor becomes `fun init(ctx: &mut TxContext)`
- [ ] Ensure objects are transferred to owners
- [ ] Check all state modifications use proper references
- [ ] Verify no hidden global state

**State Transitions Verified By:** _________________  
**Date:** _________________

---

## PHASE 3: TESTING (Move Unit Tests)

### 3.1 Create Test Module

For each module, create `module_tests.move`:

- [ ] Create test module in `tests/` directory
- [ ] Add test functions for each public function
- [ ] Test successful cases
- [ ] Test error cases
- [ ] Test object creation
- [ ] Test object transfer
- [ ] Test access control (with and without capability)
- [ ] Test state mutations
- [ ] Run `sui move test`
- [ ] Fix any failures
- [ ] Achieve 80%+ code coverage

**Test Module Created For:** _________________  
**Functions Tested:** _____  
**Coverage:** _____% 
**Tests Passing:** ☐ Yes ☐ No

### 3.2 Run Full Test Suite

```bash
sui move test
```

- [ ] All unit tests pass
- [ ] No compiler warnings
- [ ] No linting errors
- [ ] Code coverage acceptable

**Full Test Suite Pass Date:** _________________

---

## PHASE 4: CLIENT-SIDE INTEGRATION

### 4.1 Build TypeScript Client

For each public function, create wrapper:

- [ ] Create TypeScript SDK file
- [ ] Define interfaces for objects
- [ ] Create functions for each contract call:
  - [ ] Function to build PTB
  - [ ] Function to sign PTB
  - [ ] Function to execute PTB
  - [ ] Error handling
  
- [ ] Implement client-side validation
- [ ] Add event listeners (if needed)
- [ ] Add transaction monitoring

**Client Created For:** _________________  
**Functions Wrapped:** _____

### 4.2 Create Integration Tests

- [ ] Create integration test file
- [ ] Connect to devnet
- [ ] Test each function on devnet
- [ ] Test object ownership
- [ ] Test state persistence
- [ ] Test multiple transactions in sequence
- [ ] Fix any failures

**Integration Tests Created By:** _________________  
**Date:** _________________  
**Tests Passing:** ☐ Yes ☐ No

### 4.3 Build UI (if applicable)

- [ ] Create React components for each function
- [ ] Implement wallet connection (Sui Wallet)
- [ ] Create UI for state mutations
- [ ] Create UI for object transfers
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Add transaction confirmation UI
- [ ] Test end-to-end in browser

**UI Components Created:** _____ components

---

## PHASE 5: DEVNET TESTING

### 5.1 Publish to Devnet

```bash
sui client publish --gas-budget 100000000 --network devnet
```

- [ ] Connection set to devnet
- [ ] Wallet has devnet SUI
- [ ] `sui move build` succeeds
- [ ] Publishing succeeds
- [ ] Package ID recorded: _________________
- [ ] Publish transaction recorded

**Devnet Deployment Date:** _________________  
**Package ID:** _________________

### 5.2 Test on Devnet

- [ ] Create test objects on devnet
- [ ] Test all state mutations
- [ ] Test all access control
- [ ] Test ownership enforcement
- [ ] Monitor gas costs
- [ ] Check transaction finality
- [ ] Verify object evolution

**Devnet Testing Complete By:** _________________  
**Date:** _________________

### 5.3 Devnet Issues & Fixes

Issue: _________________________________  
Status: ☐ Open ☐ Fixed ☐ Won't Fix  
Resolution: _________________________________  

Issue: _________________________________  
Status: ☐ Open ☐ Fixed ☐ Won't Fix  
Resolution: _________________________________  

**All Issues Resolved:** ☐ Yes ☐ No

---

## PHASE 6: TESTNET DEPLOYMENT

### 6.1 Publish to Testnet

```bash
sui client publish --gas-budget 100000000 --network testnet
```

- [ ] Connection set to testnet
- [ ] Wallet has testnet SUI
- [ ] `sui move build` succeeds
- [ ] Publishing succeeds
- [ ] Package ID recorded: _________________
- [ ] Publish transaction recorded
- [ ] Verify on Sui Explorer: https://testnet.suiscan.xyz

**Testnet Deployment Date:** _________________  
**Package ID:** _________________

### 6.2 External Testnet Testing

- [ ] Share testnet package ID with team
- [ ] Team members test on testnet
- [ ] Test with multiple wallets
- [ ] Test rapid transaction submissions
- [ ] Test with various input values
- [ ] Document any issues found
- [ ] Fix critical issues
- [ ] Retest fixed issues

**External Testing Completed By:** _________________  
**Date:** _________________  
**Testers:** _________________

### 6.3 Security Audit (if applicable)

- [ ] Engage security auditor
- [ ] Share contract code and design docs
- [ ] Auditor reviews code on testnet
- [ ] Auditor submits report
- [ ] Address critical findings
- [ ] Address medium findings
- [ ] Address low findings
- [ ] Get auditor sign-off

**Audit Completed:** ☐ Yes ☐ Not Applicable  
**Auditor:** _________________  
**Report Date:** _________________  
**Critical Issues Found:** _____  
**All Issues Resolved:** ☐ Yes ☐ No

---

## PHASE 7: MAINNET PREPARATION

### 7.1 Final Review

- [ ] Code review completed
- [ ] All tests pass on testnet
- [ ] Security considerations documented
- [ ] Performance tested and acceptable
- [ ] Gas costs estimated and budgeted
- [ ] Upgrade path planned
- [ ] Emergency procedures documented
- [ ] Rollback procedures documented
- [ ] Team trained on support

**Final Review Completed By:** _________________  
**Date:** _________________

### 7.2 Mainnet Dry Run

- [ ] Switch to mainnet (with single test wallet)
- [ ] Deploy to mainnet with minimal gas budget
- [ ] Test critical paths
- [ ] Verify package on explorer
- [ ] Check transaction costs
- [ ] Verify object creation
- [ ] Test state mutations once
- [ ] Keep mainnet deployment for verification

**Dry Run Completed:** ☐ Yes ☐ No  
**Date:** _________________  
**Package ID (TEST):** _________________

### 7.3 Documentation

- [ ] Create deployment guide
- [ ] Document all package IDs
- [ ] Document all object types
- [ ] Create user guides
- [ ] Document API/function signatures
- [ ] Create troubleshooting guide
- [ ] Create emergency procedures
- [ ] Share documentation with team

**Documentation Complete:** ☐ Yes ☐ No

### 7.4 Stakeholder Approval

- [ ] Product manager approval: ☐ Yes ☐ No (Date: ___)
- [ ] Security approval: ☐ Yes ☐ No (Date: ___)
- [ ] Legal approval (if needed): ☐ Yes ☐ No (Date: ___)
- [ ] Executive approval (if needed): ☐ Yes ☐ No (Date: ___)

**All Approvals Obtained:** ☐ Yes ☐ No  
**Date:** _________________

---

## PHASE 8: MAINNET LAUNCH

### 8.1 Launch Day

**Pre-Launch Checklist (Day Before):**
- [ ] Verify all systems working on testnet
- [ ] Prepare launch announcement
- [ ] Brief support team
- [ ] Set up monitoring
- [ ] Have rollback plan ready
- [ ] Team on standby

**Launch Time:** _________________  
**Launch Lead:** _________________

### 8.2 Publish to Mainnet

```bash
sui client publish --gas-budget 100000000 --network mainnet
```

- [ ] Switch to mainnet wallet
- [ ] Verify sufficient SUI for gas
- [ ] Run `sui move build` one final time
- [ ] Execute publish command
- [ ] Confirm transaction
- [ ] Record package ID: _________________
- [ ] Verify on Sui Explorer: https://suiscan.xyz

**Mainnet Deployment Date:** _________________  
**Time:** _________________  
**Package ID:** _________________

### 8.3 Post-Launch Verification

- [ ] Package appears on Sui Explorer
- [ ] Can create objects
- [ ] Can modify objects
- [ ] Can transfer objects
- [ ] Access control working
- [ ] Gas costs as expected
- [ ] No unusual activity detected

**Verification Complete:** ☐ Yes ☐ No  
**Time:** _________________

### 8.4 Launch Communication

- [ ] Send launch announcement
- [ ] Update website
- [ ] Post on social media
- [ ] Notify users
- [ ] Share package ID publicly
- [ ] Add to dApp directories

**Communication Sent:** ☐ Yes ☐ No

### 8.5 Monitor & Support

- [ ] Monitor transaction success rates
- [ ] Monitor object creation
- [ ] Monitor gas costs
- [ ] Watch for unusual patterns
- [ ] Respond to user questions
- [ ] Track any bugs/issues
- [ ] Plan hot fixes if needed

**Monitoring Duration:** _____ hours/days

---

## PHASE 9: POST-LAUNCH

### 9.1 Collect Metrics

- [ ] Total objects created: _____
- [ ] Total transactions: _____
- [ ] Average gas cost: _____ MIST
- [ ] Total TVL/Value: _____
- [ ] User count: _____
- [ ] Transaction success rate: _____%
- [ ] Average transaction time: _____ ms

**Metrics Collection Date:** _________________

### 9.2 Issue Tracking

Issue #1: _________________________________  
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low  
Status: ☐ Open ☐ In Progress ☐ Fixed ☐ Won't Fix  
Resolution: _________________________________  

Issue #2: _________________________________  
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low  
Status: ☐ Open ☐ In Progress ☐ Fixed ☐ Won't Fix  
Resolution: _________________________________  

### 9.3 Improvements for Next Version

- [ ] Collect user feedback
- [ ] Identify performance bottlenecks
- [ ] Plan feature additions
- [ ] Document lessons learned
- [ ] Update documentation based on real usage
- [ ] Plan next upgrade

**Improvements Documented:** ☐ Yes ☐ No

---

## PHASE 10: ONGOING MAINTENANCE

### 10.1 Monthly Review

**Month: _________________**

- [ ] No critical issues
- [ ] Gas costs stable
- [ ] All tests passing
- [ ] Documentation up-to-date
- [ ] Security posture maintained
- [ ] Team trained on support
- [ ] Monitoring active

**Reviewed By:** _________________  
**Date:** _________________  
**Status:** ☐ Healthy ☐ Issues Found

### 10.2 Security Monitoring

- [ ] Monitor for suspicious transactions
- [ ] Watch for access control violations
- [ ] Track for unusual object patterns
- [ ] Monitor gas spiking
- [ ] Review error logs
- [ ] Update security guidelines as needed

**Security Status:** ☐ Secure ☐ Issues Found

### 10.3 Version Planning

- [ ] Track feature requests
- [ ] Plan next upgrade
- [ ] Prepare migration plan
- [ ] Test new features on testnet
- [ ] Plan rollout schedule

**Next Version Target:** _________________

---

## COMPLETION CHECKLIST

### Overall Project Status

- [ ] All contracts migrated
- [ ] All tests passing
- [ ] All code reviewed
- [ ] Security audit completed (if applicable)
- [ ] Documentation complete
- [ ] Team trained
- [ ] Mainnet deployment successful
- [ ] Post-launch monitoring active
- [ ] Users satisfied
- [ ] Metrics collected

### Milestones Completed

- [ ] Environment Setup: ___________ (Date)
- [ ] Contract Migration: ___________ (Date)
- [ ] Testing: ___________ (Date)
- [ ] Client Integration: ___________ (Date)
- [ ] Devnet Testing: ___________ (Date)
- [ ] Testnet Deployment: ___________ (Date)
- [ ] Mainnet Launch: ___________ (Date)
- [ ] Post-Launch Monitoring: ___________ (Date)

### Sign-Off

**Project Lead:** _________________  
**Date:** _________________  

**Technical Lead:** _________________  
**Date:** _________________  

**Product Manager:** _________________  
**Date:** _________________  

---

## APPENDIX: QUICK REFERENCE

### Key Sui Documentation
- Main Docs: https://docs.sui.io
- Move Book: https://move-book.com
- Sui for Ethereum: https://docs.sui.io/concepts/sui-for-ethereum
- SDK Docs: https://sdk.mystenlabs.com/

### Key Tools
- Sui CLI: `sui --help`
- Move Compiler: `sui move build`
- Package Explorer: https://suiscan.xyz

### Important Concepts
- Programmable Transaction Blocks (PTBs)
- Object Ownership (key, store abilities)
- Capability-Based Access Control
- Native Upgrade Mechanism
- Parallel Transaction Execution

### Contact Information
- Sui Discord: https://discord.gg/sui
- Sui Documentation: https://docs.sui.io
- Support Email: _________________

---

**Last Updated:** _________________  
**Next Review:** _________________  
**Document Owner:** _________________
