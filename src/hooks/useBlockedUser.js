import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

/**
 * Hook to check if user is blocked and prevent actions
 */
export const useBlockedUser = () => {
  const { user } = useAuth();
  const isBlocked = user?.is_blocked || false;

  const preventAction = useCallback((callback) => {
    if (isBlocked) {
      alert('Your account has been blocked by an administrator. You cannot perform this action.');
      return null;
    }
    return callback;
  }, [isBlocked]);

  const handleAction = useCallback(async (action) => {
    if (isBlocked) {
      alert('Your account has been blocked by an administrator. You cannot perform this action.');
      return null;
    }
    
    try {
      return await action();
    } catch (error) {
      // Check if error is due to blocked account
      if (error.response?.data?.blocked) {
        alert('Your account has been blocked by an administrator. You cannot perform this action.');
      }
      throw error;
    }
  }, [isBlocked]);

  return {
    isBlocked,
    preventAction,
    handleAction
  };
};

