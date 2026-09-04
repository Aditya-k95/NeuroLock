import React from 'react';
import { useUser } from '../context/UserContext';

/**
 * RoleGuard Component
 *
 * Conditionally renders child elements based on the current user's role
 * retrieved from UserContext.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected elements to render if authorized
 * @param {string[]|string} [props.allowedRoles=['owner']] - Roles permitted to view children (e.g. ['owner'], ['staff', 'owner'])
 * @param {React.ReactNode} [props.fallback=null] - Optional element to render when unauthorized
 * @param {string} [props.role] - Optional explicit role override
 * @returns {React.ReactNode}
 */
export default function RoleGuard({
  children,
  allowedRoles = ['owner'],
  fallback = null,
  role: propRole
}) {
  const { role: contextRole } = useUser();
  const activeRole = (propRole || contextRole || 'owner').toLowerCase();

  const allowedList = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => String(r).toLowerCase())
    : [String(allowedRoles).toLowerCase()];

  const isAllowed = allowedList.includes(activeRole);

  if (isAllowed) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

export { useUser } from '../context/UserContext';
