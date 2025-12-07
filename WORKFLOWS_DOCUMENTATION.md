# GitHub Workflows Documentation

**Repository**: Crozz-Coin  
**Date**: December 7, 2025  
**Status**: ✅ All Workflows Configured

---

## Overview

This document describes all GitHub Actions workflows configured for the Crozz-Coin project. These workflows provide automated testing, building, deployment, and maintenance tasks.

---

## Workflow Reference

### 1. UI Build & Test (`ui-build-test.yml`)

**Trigger**: Push to main/develop or PR with UI/dApps changes  
**Frequency**: On-demand (push/PR) + Manual trigger

**Purpose**: Build and test the main UI application and all dApps

**Jobs**:
- **build**: 
  - Node 18.x and 20.x matrix testing
  - Dependency installation
  - Main UI build
  - TypeScript compilation
  - Lint checks (if configured)
  - All dApps build
  - Artifact upload (5 day retention)

- **test**:
  - Unit tests (if configured)
  - Test script execution

- **deploy-preview**:
  - PR comment with build info
  - Build artifacts available

- **notify**:
  - Final status check
  - Failure notification

**Artifacts**:
- Build artifacts for Node 18.x and 20.x
- Available for 5 days

---

### 2. UI Deploy to Production (`ui-deploy.yml`)

**Trigger**: Push to main branch  
**Frequency**: On-demand (manual) or automatic on main push

**Purpose**: Build and deploy UI to production (GitHub Pages)

**Jobs**:
- **build-and-deploy**:
  - Install dependencies
  - Build application
  - Verify build output
  - Deploy to GitHub Pages
  - Create deployment record
  - Notify via commit comment

**Environment**: Production  
**Deployment URL**: https://crozz-coin.example.com (update with your domain)

**Note**: Requires GitHub Pages to be enabled in repository settings

---

### 3. Security & Dependencies Check (`security-deps.yml`)

**Trigger**: Weekly on Sunday + Schedule + PR changes to package.json  
**Frequency**: Weekly + Push/PR to dependencies

**Purpose**: Security scanning and dependency health check

**Jobs**:
- **dependency-check**:
  - Check for outdated packages
  - Audit for vulnerabilities
  - Report Mysten package versions
  - Creates detailed report

- **security-scan**:
  - Trivy filesystem scanning
  - Vulnerability detection
  - SARIF report generation
  - GitHub Security tab integration

- **typescript-check**:
  - UI strict mode check
  - dApps TypeScript verification
  - Type safety validation

- **license-check**:
  - License compliance scanning
  - Generates license report

- **create-issue**:
  - Creates GitHub issue if checks fail
  - Labels: security, dependencies

**Output**:
- Vulnerability report
- License compliance report
- Dependency audit results

---

### 4. Documentation Sync & Update (`docs-update.yml`)

**Trigger**: Push to main with MD/code changes  
**Frequency**: On-demand (manual) or automatic

**Purpose**: Validate and update documentation

**Jobs**:
- **validate-docs**:
  - Markdown linting
  - Link checking
  - Format validation

- **generate-api-docs**:
  - TypeDoc generation
  - API documentation
  - Component docs

- **update-readme**:
  - Version extraction
  - Documentation summary
  - Commit comment notification

- **publish-docs-to-wiki**:
  - Copy docs to GitHub Wiki
  - Sync deployment guide
  - Sync UI components guide

**Output**:
- API documentation artifacts
- Updated GitHub Wiki
- Documentation validation report

---

### 5. dApps Dependencies Auto-Update (`dapps-auto-update.yml`)

**Trigger**: Weekly on Monday + Manual trigger  
**Frequency**: Weekly scheduled

**Purpose**: Keep dApps dependencies synchronized with main project

**Jobs**:
- **check-dapps-versions**:
  - Compare dApps versions
  - Generate compatibility report
  - Identify outdated packages

- **update-dapps**:
  - Get latest main project versions
  - Update each dApp
  - Install and build verification
  - Creates auto-update PR

- **create-summary**:
  - Generate version compatibility report
  - Document recommended versions

**Output**:
- Auto-update pull request
- Version compatibility report

**Auto PR Details**:
- Branch: `auto-update-dapps-deps`
- Includes: All dependency updates
- Labels: `dependencies`, `automated`

---

### 6. E2E Tests - Wallet Integration (`e2e-tests.yml`)

**Trigger**: Push to main/develop or PR with UI changes  
**Frequency**: On-demand + Manual trigger

**Purpose**: End-to-end testing of wallet integration

**Jobs**:
- **e2e-wallet-tests**:
  - Playwright test setup
  - Wallet connection tests
  - Button visibility checks
  - Modal interaction tests
  - Network status verification
  - HTML report generation

- **component-tests**:
  - Vitest component testing
  - Modal component tests
  - Component unit tests

- **lint-tests**:
  - ESLint checks
  - Prettier formatting
  - Code style validation

- **test-summary**:
  - Aggregates all test results
  - Generates summary report

**Test Framework**: Playwright + Vitest  
**Reports**: HTML reports uploaded as artifacts

**Test Coverage**:
- UI component rendering
- Wallet connection flow
- Modal dialogs
- Recommendations panel
- Network status display

---

### 7. Version Sync & Release Prep (`version-sync.yml`)

**Trigger**: Manual trigger (workflow_dispatch) + PR to package.json  
**Frequency**: On-demand

**Purpose**: Sync versions and prepare releases

**Jobs**:
- **sync-versions**:
  - Extract main project version
  - Check consistency across dApps
  - Get dependency versions
  - Generate version matrix

- **changelog-check**:
  - Verify CHANGELOG.md updates
  - Optional check for non-release commits

- **release-prep**:
  - Generate release notes template
  - Create version history
  - Document breaking changes
  - List updated dependencies

**Output**:
- Version compatibility matrix
- Release notes draft
- Version consistency report

**PR Comments**: Includes version information

---

### 8. Continuous Integration Status (`ci-status.yml`)

**Trigger**: Push to main/develop + Workflow run completion  
**Frequency**: Continuous

**Purpose**: Monitor and report CI status

**Jobs**:
- **ci-status**:
  - Aggregate workflow results
  - Generate status badge
  - List recent commits
  - Report deployment status

- **monitor-performance**:
  - Measure build time
  - Calculate bundle sizes
  - Track performance metrics

- **health-check**:
  - Verify critical files exist
  - Check directory structure
  - Validate documentation
  - Report project health

- **summary**:
  - Final status aggregation
  - Success/failure reporting

**Output**:
- CI status markdown
- Build metrics
- Project health report
- Performance data

---

## Workflow Schedules

| Workflow | Schedule | Trigger |
|----------|----------|---------|
| UI Build & Test | On push/PR | Automatic |
| UI Deploy | On main push | Automatic |
| Security & Deps | Weekly Sunday | Scheduled + Manual |
| Documentation | On docs change | Automatic |
| dApps Auto-Update | Weekly Monday | Scheduled + Manual |
| E2E Tests | On UI change | Automatic |
| Version Sync | Manual only | On-demand |
| CI Status | Continuous | Always |

---

## Environment Variables & Secrets

### Required Secrets (add in repo settings):

```
GITHUB_TOKEN          # Automatically provided by GitHub
CUSTOM_DOMAIN         # For deployment (optional)
DEPLOY_KEY            # For deployment (optional)
```

### Configuration:

All workflows use standard GitHub environment variables:
- `GITHUB_SHA` - Commit hash
- `GITHUB_REF` - Branch name
- `GITHUB_ACTOR` - Commit author
- `GITHUB_SERVER_URL` - GitHub domain

---

## Running Workflows Manually

### From GitHub UI:

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Select branch (default: main)
5. Click **Run workflow**

### Using GitHub CLI:

```bash
# List workflows
gh workflow list

# Run specific workflow
gh workflow run "UI Build & Test" --ref main

# View workflow runs
gh run list --workflow=ui-build-test.yml
```

---

## Monitoring Workflows

### Check Status:
- **GitHub Actions tab**: See real-time execution
- **Commit status**: Green checkmark = all passed
- **PR checks**: Required status checks must pass

### View Logs:
1. Click on workflow run
2. Select job
3. View detailed logs
4. Download artifacts if needed

### Set Up Notifications:
1. Settings → Notifications
2. Enable workflow notifications
3. Select notification preferences

---

## Troubleshooting

### Build Failures

**Check**:
1. View workflow logs
2. Look for error messages
3. Verify dependencies
4. Check TypeScript errors

**Fix**:
```bash
cd sui-stack-hello-world/ui
pnpm install
pnpm build
npx tsc --noEmit
```

### Dependency Issues

**Check**:
1. View security-deps.yml logs
2. Review audit report
3. Check version compatibility

**Fix**:
```bash
pnpm audit fix
pnpm update
pnpm install --frozen-lockfile
```

### E2E Test Failures

**Check**:
1. Download HTML report from artifacts
2. Review Playwright traces
3. Check for timeout issues

**Fix**:
- Increase timeout in playwright.config.ts
- Check server is running
- Verify test selectors are correct

### Deployment Issues

**Check**:
1. View ui-deploy.yml logs
2. Verify GitHub Pages settings
3. Check domain configuration

**Fix**:
- Enable GitHub Pages in settings
- Set custom domain if needed
- Verify build output exists

---

## Best Practices

### For PRs:
✅ Wait for all checks to pass before merge  
✅ Review workflow logs if checks fail  
✅ Test locally before pushing  

### For Commits:
✅ Use meaningful commit messages  
✅ Update CHANGELOG.md  
✅ Keep package.json clean  

### For Dependencies:
✅ Review security alerts  
✅ Keep dApps versions in sync  
✅ Use pnpm for monorepo  

### For Releases:
✅ Run version-sync workflow  
✅ Review generated release notes  
✅ Tag release in GitHub  
✅ Publish release notes  

---

## Performance Metrics

### Expected Build Times:
- **UI Build**: ~15-20 seconds
- **dApps Build**: ~5-10 seconds each
- **TypeScript Check**: ~5 seconds
- **E2E Tests**: ~30-60 seconds

### Cache Hit Rates:
- **pnpm store**: ~90% on repeated runs
- **Node modules**: Cached via lockfile
- **Build artifacts**: 5-30 days retention

---

## Security Considerations

✅ **Code Scanning**: Trivy vulnerability scanning  
✅ **Dependency Audit**: Weekly security checks  
✅ **Access Control**: GitHub token auto-expires  
✅ **Secret Rotation**: Automatic via GitHub  

---

## Customization

### Add New Workflow:

1. Create `.github/workflows/new-workflow.yml`
2. Define triggers and jobs
3. Push to repository
4. Workflow appears in Actions tab

### Modify Existing Workflow:

1. Edit `.github/workflows/filename.yml`
2. Update triggers/jobs as needed
3. Push changes
4. Changes take effect immediately

### Disable Workflow:

1. Delete file from `.github/workflows/`
2. Or add `if: false` to job
3. Push changes

---

## Workflow Matrix Strategy

### Node Version Matrix:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

This tests with multiple Node versions to ensure compatibility.

### Operating System Matrix:

To add OS testing:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [20.x]
```

---

## Integration with External Services

### GitHub Pages Deployment:
- Automatic on main branch push
- Updates production site
- Custom domain supported

### GitHub Wiki Sync:
- Automatic documentation sync
- Updates project wiki pages
- Keeps docs current

### GitHub Issues:
- Auto-creates issues on security failures
- Links to workflow runs
- Labels for categorization

### Artifact Storage:
- Build artifacts: 5 days
- Test reports: 7 days
- API docs: 30 days

---

## Maintenance Schedule

| Day | Task | Workflow |
|-----|------|----------|
| Sunday | Security scan | security-deps.yml |
| Monday | dApps update | dapps-auto-update.yml |
| Daily | Build & test | ui-build-test.yml |
| Daily | CI status | ci-status.yml |

---

## Documentation

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Workflow Syntax**: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
- **Marketplace**: https://github.com/marketplace?type=actions

---

**Last Updated**: December 7, 2025  
**Maintained By**: Development Team  
**Status**: 🟢 All Workflows Operational

