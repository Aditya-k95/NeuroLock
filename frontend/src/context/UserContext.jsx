import React, { createContext, useContext, useState } from 'react';

/**
 * User Context for Role-Based Access Control (Owner vs. Staff)
 *
 * Owner: Full administrative view (sees all alerts, telemetry, attack simulator, configuration).
 * Staff: Scoped operational view (sees only assigned alerts, restricted from simulating attacks).
 */
const UserContext = createContext({
  user: {
    name: 'MSME Owner',
    email: 'admin@fintech.in',
    role: 'owner'
  },
  role: 'owner',
  setRole: () => {},
  toggleRole: () => {},
  setUser: () => {}
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem('neurolock_user_role') || 'owner';
    const savedEmail = localStorage.getItem('neurolock_user_email') || (savedRole === 'owner' ? 'admin@fintech.in' : 'sarah.jenkins@fintech.in');
    return {
      name: savedRole === 'owner' ? 'Aditya (MSME Owner)' : 'Sarah Jenkins (Staff)',
      email: savedEmail,
      role: savedRole
    };
  });

  const setRole = (newRole) => {
    const roleNormalized = String(newRole).toLowerCase() === 'staff' ? 'staff' : 'owner';
    const updatedUser = {
      ...user,
      role: roleNormalized,
      name: roleNormalized === 'owner' ? 'Aditya (MSME Owner)' : 'Sarah Jenkins (Staff)',
      email: roleNormalized === 'owner' ? 'admin@fintech.in' : 'sarah.jenkins@fintech.in'
    };
    setUser(updatedUser);
    localStorage.setItem('neurolock_user_role', roleNormalized);
    localStorage.setItem('neurolock_user_email', updatedUser.email);
  };

  const toggleRole = () => {
    setRole(user.role === 'owner' ? 'staff' : 'owner');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        role: user.role || 'owner',
        setRole,
        toggleRole,
        setUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;
