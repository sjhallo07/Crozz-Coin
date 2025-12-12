import { create } from "zustand";
import type { AdminUser, UserRole, Permission } from "../types/admin";
import { ROLE_PERMISSIONS } from "../types/admin";

interface AdminState {
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  setCurrentUser: (user: AdminUser | null) => void;
  setAdminUsers: (users: AdminUser[]) => void;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  addAdminUser: (user: AdminUser) => void;
  removeAdminUser: (address: string) => void;
  updateUserRole: (address: string, role: UserRole) => void;
  getAllAdminUsers: () => AdminUser[];
  getAdminUserByAddress: (address: string) => AdminUser | undefined;
  initializeDefaultAdmin: (address: string) => void;
}

// Initialize with a default demo admin user
const defaultAdminUser: AdminUser = {
  address: "0x0000000000000000000000000000000000000000000000000000000000000000",
  role: "super_admin",
  permissions: ["view_dashboard", "manage_users", "manage_greetings", "configure_system", 
                "deploy_contracts", "manage_admins", "view_analytics", "execute_functions"],
  createdAt: new Date(),
  lastActivity: new Date(),
};

export const useAdminStore = create<AdminState>((set, get) => ({
  currentUser: defaultAdminUser,
  adminUsers: [defaultAdminUser],

  setCurrentUser: (user) => set({ currentUser: user }),

  setAdminUsers: (users) => set({ adminUsers: users }),

  hasPermission: (permission: Permission) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    const rolePerms = ROLE_PERMISSIONS[currentUser.role];
    return rolePerms.permissions.includes(permission);
  },

  isAdmin: () => {
    const { currentUser } = get();
    return currentUser?.role === "admin" || currentUser?.role === "super_admin";
  },

  isSuperAdmin: () => {
    const { currentUser } = get();
    return currentUser?.role === "super_admin";
  },

  addAdminUser: (user) =>
    set((state) => {
      // Check if user already exists
      if (state.adminUsers.find((u) => u.address === user.address)) {
        return state;
      }
      return {
        adminUsers: [...state.adminUsers, user],
      };
    }),

  removeAdminUser: (address) =>
    set((state) => {
      // Prevent removing the last super admin
      const remainingSuperAdmins = state.adminUsers.filter(
        (u) => u.role === "super_admin" && u.address !== address
      );
      if (remainingSuperAdmins.length === 0) {
        console.warn("Cannot remove the last super admin");
        return state;
      }
      return {
        adminUsers: state.adminUsers.filter((u) => u.address !== address),
      };
    }),

  updateUserRole: (address, role) =>
    set((state) => ({
      adminUsers: state.adminUsers.map((u) =>
        u.address === address ? { ...u, role, lastActivity: new Date() } : u
      ),
      // Update current user role if it's the same address
      currentUser:
        state.currentUser?.address === address && state.currentUser
          ? { ...state.currentUser, role, lastActivity: new Date() }
          : state.currentUser,
    })),

  getAllAdminUsers: () => {
    const { adminUsers } = get();
    return adminUsers;
  },

  getAdminUserByAddress: (address) => {
    const { adminUsers } = get();
    return adminUsers.find((user) => user.address === address);
  },

  initializeDefaultAdmin: (address) => {
    set({
      currentUser: {
        address,
        role: "admin",
        permissions: ROLE_PERMISSIONS.admin.permissions,
        createdAt: new Date(),
        lastActivity: new Date(),
      },
    });
  },
}));
