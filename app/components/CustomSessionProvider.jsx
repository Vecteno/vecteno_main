'use client'

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

const CustomSessionContext = createContext();

export function CustomSessionProvider({ children }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [customSession, setCustomSession] = useState(null);
  const [customStatus, setCustomStatus] = useState('loading');

  useEffect(() => {
    // If NextAuth has a session, use it
    if (nextAuthSession?.user) {
      setCustomSession(nextAuthSession);
      setCustomStatus('authenticated');
      return;
    }

    // If NextAuth says unauthenticated, check for custom JWT
    if (nextAuthStatus === 'unauthenticated') {
      const checkCustomAuth = async () => {
        try {
          const response = await fetch('/api/profileInfo');
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.user) {
              // Create a session-like object from custom auth
              setCustomSession({
                user: {
                  id: userData.user._id || userData.user.id,
                  email: userData.user.email,
                  name: userData.user.name,
                  image: userData.user.profileImage,
                  role: userData.user.role || 'user'
                },
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              });
              setCustomStatus('authenticated');
            } else {
              setCustomStatus('unauthenticated');
            }
          } else {
            setCustomStatus('unauthenticated');
          }
        } catch (error) {
          console.error('Error checking custom auth:', error);
          setCustomStatus('unauthenticated');
        }
      };

      checkCustomAuth();
    } else if (nextAuthStatus === 'loading') {
      setCustomStatus('loading');
    }
  }, [nextAuthSession, nextAuthStatus]);

  const value = {
    data: customSession,
    status: customStatus
  };

  return (
    <CustomSessionContext.Provider value={value}>
      {children}
    </CustomSessionContext.Provider>
  );
}

export function useCustomSession() {
  const context = useContext(CustomSessionContext);
  if (context === undefined) {
    throw new Error('useCustomSession must be used within a CustomSessionProvider');
  }
  return context;
}
