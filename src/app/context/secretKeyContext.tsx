

// AuthContext.js
import React, { createContext, useState, useContext, ReactNode } from 'react';

const AuthContext = createContext({sk: "", signIn: (sk: string) => {}});

export function useSkContext() {
  return useContext(AuthContext);
}


type SecretKeyProviderProps = {
  children: ReactNode;
};

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [sk, setSk] = useState('');

  const signIn = (newSk: string) => {
    setSk(newSk);
  };


  return (
    <AuthContext.Provider value={{sk, signIn}}>
      {children}
    </AuthContext.Provider>
  );
}
