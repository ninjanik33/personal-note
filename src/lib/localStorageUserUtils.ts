// Utility functions for managing users in localStorage (demo mode)

export interface LocalStorageUser {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

export interface LocalStorageUserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  account_status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  last_active_at: string;
  [key: string]: any;
}

// Get all users from localStorage
export const getAllUsers = (): LocalStorageUser[] => {
  try {
    return JSON.parse(localStorage.getItem("noteapp_users") || "[]");
  } catch (error) {
    console.error("Error parsing users from localStorage:", error);
    return [];
  }
};

// Get all user profiles from localStorage
export const getAllUserProfiles = (): LocalStorageUserProfile[] => {
  try {
    return JSON.parse(localStorage.getItem("noteapp_user_profiles") || "[]");
  } catch (error) {
    console.error("Error parsing user profiles from localStorage:", error);
    return [];
  }
};

// Get pending users (for admin review)
export const getPendingUsers = (): LocalStorageUserProfile[] => {
  return getAllUserProfiles().filter(
    (profile) => profile.account_status === "pending",
  );
};

// Approve a user by username
export const approveUser = (username: string): boolean => {
  try {
    const profiles = getAllUserProfiles();
    const profileIndex = profiles.findIndex(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (profileIndex === -1) {
      console.error(`User ${username} not found`);
      return false;
    }

    profiles[profileIndex].account_status = "approved";
    profiles[profileIndex].updated_at = new Date().toISOString();

    localStorage.setItem("noteapp_user_profiles", JSON.stringify(profiles));
    console.log(`User ${username} has been approved`);
    return true;
  } catch (error) {
    console.error("Error approving user:", error);
    return false;
  }
};

// Reject a user by username
export const rejectUser = (username: string): boolean => {
  try {
    const profiles = getAllUserProfiles();
    const profileIndex = profiles.findIndex(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (profileIndex === -1) {
      console.error(`User ${username} not found`);
      return false;
    }

    profiles[profileIndex].account_status = "rejected";
    profiles[profileIndex].updated_at = new Date().toISOString();

    localStorage.setItem("noteapp_user_profiles", JSON.stringify(profiles));
    console.log(`User ${username} has been rejected`);
    return true;
  } catch (error) {
    console.error("Error rejecting user:", error);
    return false;
  }
};

// Delete a user by username (remove from both users and profiles)
export const deleteUser = (username: string): boolean => {
  try {
    const users = getAllUsers();
    const profiles = getAllUserProfiles();

    const userIndex = users.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    const profileIndex = profiles.findIndex(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (userIndex === -1) {
      console.error(`User ${username} not found`);
      return false;
    }

    users.splice(userIndex, 1);
    if (profileIndex !== -1) {
      profiles.splice(profileIndex, 1);
    }

    localStorage.setItem("noteapp_users", JSON.stringify(users));
    localStorage.setItem("noteapp_user_profiles", JSON.stringify(profiles));
    console.log(`User ${username} has been deleted`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

// Get user status by username
export const getUserStatus = (username: string): string | null => {
  const profiles = getAllUserProfiles();
  const profile = profiles.find(
    (p) => p.username.toLowerCase() === username.toLowerCase(),
  );
  return profile ? profile.account_status : null;
};

// Console helper functions for easy testing
export const userAdmin = {
  // List all users
  list: () => {
    const profiles = getAllUserProfiles();
    console.table(
      profiles.map((p) => ({
        username: p.username,
        email: p.email,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        status: p.account_status,
        created: new Date(p.created_at).toLocaleDateString(),
      })),
    );
    return profiles;
  },

  // List pending users
  pending: () => {
    const pending = getPendingUsers();
    console.table(
      pending.map((p) => ({
        username: p.username,
        email: p.email,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        created: new Date(p.created_at).toLocaleDateString(),
      })),
    );
    return pending;
  },

  // Approve user
  approve: (username: string) => {
    const success = approveUser(username);
    if (success) {
      console.log(`✅ User "${username}" approved successfully`);
    } else {
      console.error(`❌ Failed to approve user "${username}"`);
    }
    return success;
  },

  // Reject user
  reject: (username: string) => {
    const success = rejectUser(username);
    if (success) {
      console.log(`❌ User "${username}" rejected`);
    } else {
      console.error(`❌ Failed to reject user "${username}"`);
    }
    return success;
  },

  // Delete user
  delete: (username: string) => {
    const success = deleteUser(username);
    if (success) {
      console.log(`🗑️ User "${username}" deleted`);
    } else {
      console.error(`❌ Failed to delete user "${username}"`);
    }
    return success;
  },

  // Check status
  status: (username: string) => {
    const status = getUserStatus(username);
    if (status) {
      console.log(`User "${username}" status: ${status}`);
    } else {
      console.error(`User "${username}" not found`);
    }
    return status;
  },

  // Help
  help: () => {
    console.log(`
Available commands for user management in demo mode:

userAdmin.list()                    - List all users
userAdmin.pending()                 - List pending users
userAdmin.approve('username')       - Approve a user
userAdmin.reject('username')        - Reject a user
userAdmin.delete('username')        - Delete a user
userAdmin.status('username')        - Check user status
userAdmin.help()                    - Show this help

Example usage:
userAdmin.pending()                 // See who needs approval
userAdmin.approve('johndoe')        // Approve user 'johndoe'
`);
  },
};

// Make userAdmin available globally in development
if (typeof window !== "undefined") {
  (window as any).userAdmin = userAdmin;
}
