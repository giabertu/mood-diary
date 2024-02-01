

// AuthContext.js
import React, { createContext, useState, useContext, ReactNode } from 'react';

const AuthContext = createContext({sk: "", setSecret: (sk: string) => {}});

export function useSkContext() {
  return useContext(AuthContext);
}


type SecretKeyProviderProps = {
  children: ReactNode;
};

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [sk, setSecret] = useState('');



  return (
    <AuthContext.Provider value={{sk, setSecret}}>
      {children}
    </AuthContext.Provider>
  );
}
