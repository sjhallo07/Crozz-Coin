# Admin RBAC System - Visual Guide & Screenshots

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Crozz Coin Dashboard                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Left Sidebar            │  Main Content Area                │
│  ──────────────          │  ────────────────────             │
│                          │                                    │
│  • Overview              │  Dashboard Overview               │
│  • User Panel            │  ┌──────────────────────────┐    │
│  • RBAC Dashboard ◄──────┤  │ Current Role: 👑 Admin   │    │
│  • Admin Panel           │  │ Permissions: 5/8         │    │
│  • Configuration         │  │ Contracts Available: 12  │    │
│  • Admin Management      │  └──────────────────────────┘    │
│                          │                                    │
│                          │  [Role Mgmt] [Contracts] [Perms]  │
│                          │     [Settings] (Super Admin only)  │
│                          │                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📑 Tab Views

### 1. Role Management Tab

```
┌──────────────────────────────────────────────┐
│ 👑 Admin Configuration Panel                 │
├──────────────────────────────────────────────┤
│                                              │
│ Current Admin Status                         │
│ ├─ Role: super_admin                        │
│ ├─ Is Super Admin: Yes ✓                    │
│ └─ Permissions: 8/8                         │
│                                              │
│ Super Admin Controls                         │
│ ├─ [Manage Users]                           │
│ ├─ [Deploy Contracts]                       │
│ └─ [View Analytics]                         │
│                                              │
└──────────────────────────────────────────────┘
```

### 2. Smart Contracts Tab

```
┌──────────────────────────────────────────────┐
│ ⚡ Smart Contract Executor                    │
├──────────────────────────────────────────────┤
│                                              │
│ Available Functions                          │
│ ┌────────────────────────────────────────┐  │
│ │ Select a function to execute...    ▼  │  │
│ │ • greetings::new_greeting             │  │
│ │ • greetings::update_greeting          │  │
│ │ • coins::mint_token                   │  │
│ │ • coins::burn_token                   │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Function: new_greeting (Module: greetings)  │
│ Create a new greeting in the system          │
│ Return Type: Object<Greeting>               │
│                                              │
│ Parameters (2)                               │
│ ├─ message: String [required]               │
│ │  ┌────────────────────────────────────┐  │
│ │  │ Enter message here...              │  │
│ │  └────────────────────────────────────┘  │
│ │                                           │
│ └─ owner: Address [required]                │
│    ┌────────────────────────────────────┐  │
│    │ Enter wallet address...            │  │
│    └────────────────────────────────────┘  │
│                                              │
│ [Execute Function]                          │
│                                              │
└──────────────────────────────────────────────┘
```

### 3. Permissions Tab

```
┌──────────────────────────────────────────────┐
│ 🔐 Your Permissions                          │
├──────────────────────────────────────────────┤
│                                              │
│ ✓ view_dashboard                            │
│ ✓ manage_users                              │
│ ✓ manage_greetings                          │
│ ✓ configure_system                          │
│ ✓ deploy_contracts                          │
│ ✓ manage_admins                             │
│ ✓ view_analytics                            │
│ ✓ execute_functions                         │
│                                              │
│ Legend: ✓ = Granted  ✗ = Denied            │
│                                              │
└──────────────────────────────────────────────┘
```

### 4. Settings Tab (Super Admin Only)

```
┌──────────────────────────────────────────────┐
│ ⚙️ System Settings                            │
├──────────────────────────────────────────────┤
│                                              │
│ Super Admin system settings available here.  │
│ Configure ecosystem parameters,              │
│ manage integrations, and monitor system      │
│ health.                                      │
│                                              │
│ [Coming Soon]                                │
│                                              │
└──────────────────────────────────────────────┘
```

## 🔄 User Flow - Role Upgrade

### For Non-Admin Users

```
┌─────────────────────────────────────┐
│  🔐 Admin-Only Section              │
├─────────────────────────────────────┤
│                                     │
│ This section is restricted to       │
│ administrators.                     │
│                                     │
│ Current Role: user                  │
│                                     │
│ Available Roles:                    │
│ ┌─ 👑 Admin                         │
│ │  Admin with management            │
│ │  capabilities                     │
│ │                                   │
│ └─ 🌟 Super Admin                   │
│    Super admin with full access     │
│                                     │
│ [Request Admin Access]              │
│                                     │
└─────────────────────────────────────┘
```

## 🎬 Smart Contract Execution Flow

```
User Opens Dashboard
        ↓
        ├─ Is Admin? ──NO──→ Show Role Upgrade Panel
        │                         ↓
        │                    [Request Admin Access]
        │
        └─ YES
            ↓
        Click RBAC Dashboard Tab
            ↓
        Select Smart Contracts Tab
            ↓
        Choose Function from Dropdown
            ↓
        View Function Details
        ├─ Description
        ├─ Parameters
        ├─ Return Type
        └─ Required Permissions
            ↓
        Enter Parameter Values
            ↓
        Has Execute Permission? ──NO──→ Show Error
        │
        └─ YES
            ↓
        [Execute Function] Button
            ↓
        Validate Parameters
            ↓
        Execute Transaction
            ↓
        Show Result Modal
        ├─ Status (Success/Error)
        ├─ Transaction ID
        ├─ Gas Used
        └─ Timestamp
            ↓
        [Close Modal]
```

## 📊 Statistics Dashboard

```
┌──────────────────────────────────────────────┐
│ Dashboard Statistics                         │
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│ │ Total    │  │ Active   │  │ Smart    │   │
│ │ Admin    │  │Permissions│ │Contracts │   │
│ │ Users    │  │          │  │          │   │
│ │    1     │  │    8     │  │   12     │   │
│ │          │  │          │  │          │   │
│ └──────────┘  └──────────┘  └──────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

## 🎨 Component Color Scheme

```
Primary Colors (Crozz Coin Theme)
├─ Purple: #8b5cf6 (Primary CTA buttons)
├─ Pink: #ec4899 (Accent & highlights)
├─ Dark BG: rgba(30, 27, 75, 0.5) (Card background)
├─ Light Text: #e0e7ff (Body text)
├─ Dark Purple: #3b3366 (Borders)
├─ Blue: #1e40af (Info sections)
└─ Gray: #6b7280 (Disabled states)

Status Indicators
├─ Green: #10b981 (Success/Allowed)
├─ Red: #ef4444 (Denied/Error)
├─ Amber: #f97316 (Warning/Mutable)
└─ Blue: #60a5fa (Info/Loading)
```

## 📱 Responsive Design

```
Desktop (1200px+)
┌─────┬──────────────────────┐
│     │                      │
│ Nav │   Admin Dashboard    │
│     │                      │
│     ├──────────────────────┤
│     │  Tabs & Content      │
│     │                      │
└─────┴──────────────────────┘

Tablet (768px-1199px)
┌────────────────────────┐
│ Navigation             │
├────────────────────────┤
│ Admin Dashboard        │
│                        │
├────────────────────────┤
│ Tabs & Content         │
│                        │
└────────────────────────┘

Mobile (< 768px)
┌──────────────┐
│ Menu Icon    │
├──────────────┤
│ Dashboard    │
│              │
├──────────────┤
│ Tabs         │
│ (Scrollable) │
│              │
└──────────────┘
```

## 🔔 Notifications & States

### Success State (After Execution)

```
┌──────────────────────────────────────┐
│ ✅ Success                            │
├──────────────────────────────────────┤
│                                      │
│ Function greetings::new_greeting     │
│ executed successfully                │
│                                      │
│ Transaction: 0x1234...abcd           │
│                                      │
│ Gas Used: 5,234                      │
│                                      │
│ Timestamp: 2024-01-15 14:30:45       │
│                                      │
│ [Close]                              │
│                                      │
└──────────────────────────────────────┘
```

### Error State (Permission Denied)

```
┌──────────────────────────────────────┐
│ 🔒 Permission Denied                  │
├──────────────────────────────────────┤
│                                      │
│ You don't have permission to         │
│ execute smart contract functions.    │
│                                      │
│ Only admins and super admins can     │
│ access this feature.                 │
│                                      │
│ Required Permission:                 │
│ execute_functions                    │
│                                      │
└──────────────────────────────────────┘
```

## 🔐 Permission Hierarchy

```
User
 └─ view_dashboard
 └─ view_analytics

        ↓ Upgrade to

Admin
 ├─ view_dashboard
 ├─ manage_users
 ├─ manage_greetings
 ├─ view_analytics
 └─ execute_functions

        ↓ Upgrade to

Super Admin
 ├─ view_dashboard
 ├─ manage_users
 ├─ manage_greetings
 ├─ configure_system
 ├─ deploy_contracts
 ├─ manage_admins
 ├─ view_analytics
 └─ execute_functions
```

## 🎯 Interaction Examples

### Example 1: Execute Function

```
1. Admin clicks RBAC Dashboard
   ↓
2. Navigates to Smart Contracts tab
   ↓
3. Selects "greetings::new_greeting"
   ↓
4. Enters parameters:
   - message: "Hello Crozz Coin!"
   - owner: 0x1234...
   ↓
5. Clicks [Execute Function]
   ↓
6. Permission check: ✓ execute_functions
   ↓
7. Transaction submitted
   ↓
8. Modal shows:
   ✅ Success
   Transaction: 0x5678...
   Gas: 5,234
   ↓
9. Admin clicks [Close]
```

### Example 2: Request Admin Access

```
1. User navigates to Dashboard
   ↓
2. RBAC Dashboard tab is HIDDEN
   (no admin permission)
   ↓
3. User tries to access admin section
   ↓
4. Role Upgrade Panel shown:
   Current Role: user
   Available: admin, super_admin
   ↓
5. User clicks [Request Admin Access]
   ↓
6. Notification sent to super admin
   (Note: In future phases)
```

## 📈 Admin Metrics Dashboard

```
Today's Activity
├─ Admin Users: 1
├─ Function Executions: 5
├─ Failed Transactions: 0
└─ Total Gas Used: 28,450

Recent Actions
├─ 14:30 - execute_functions (John)
├─ 14:25 - manage_greetings (Admin)
├─ 14:20 - view_analytics (User1)
└─ 14:15 - execute_functions (Admin2)

System Health
├─ Status: ✓ Healthy
├─ Admin Panel: ✓ Online
├─ Contract Executor: ✓ Ready
└─ Last Sync: 2 minutes ago
```

## 🎨 Light/Dark Mode Support

```
Dark Mode (Default - Crozz Coin Theme)
├─ Background: #0f0e1e
├─ Cards: rgba(30, 27, 75, 0.5)
├─ Text: #e0e7ff
├─ Borders: #3b3366
└─ Accents: #8b5cf6 / #ec4899

Light Mode (Future)
├─ Background: #f8f7ff
├─ Cards: #ffffff
├─ Text: #2d1b4e
├─ Borders: #c4b5fd
└─ Accents: #8b5cf6 / #ec4899
```

---

## Key Takeaways

✅ **User-Friendly**: Clear role indicators and permission displays
✅ **Secure**: Permission-based access control throughout
✅ **Responsive**: Works on desktop, tablet, and mobile
✅ **Themeable**: Consistent Crozz Coin branding
✅ **Extensible**: Easy to add new permissions and functions
✅ **Documented**: Complete guides and examples

---

**Last Updated**: 2024 | **Version**: 1.0
