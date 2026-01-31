import React, { createContext, useContext, useMemo, useState } from 'react';

type UserContextValue = {
  displayName: string;
  isLoggedIn: boolean;
  setUser: (displayName: string | null, isLoggedIn: boolean) => void;
};

const defaultValue: UserContextValue = {
  displayName: 'Guest',
  isLoggedIn: false,
  setUser: () => {},
};

const UserContext = createContext<UserContextValue>(defaultValue);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = useMemo(
    () => ({
      displayName,
      isLoggedIn,
      setUser: (name: string | null, loggedIn: boolean) => {
        setDisplayName(loggedIn && name ? name : 'Guest');
        setIsLoggedIn(loggedIn);
      },
    }),
    [displayName, isLoggedIn]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context == null) {
    return defaultValue;
  }
  return context;
}
