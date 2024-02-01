

// AuthContext.js
import React, { createContext, useState, useContext, ReactNode, SetStateAction, Dispatch, useEffect } from 'react';
import { KeyPair } from '../services/NostrService';
import { useRouter } from 'next/router';

const AuthContext = createContext({ keyPair: { sk: new Uint8Array(), nsec: '', pk: '', npub: '' }, setKeyPair: (keypair: KeyPair) => { } });

export function useSkContext() {
  return useContext(AuthContext);
}


type SecretKeyProviderProps = {
  children: ReactNode;
};

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [keyPair, setKeyPair] = useState({ sk: new Uint8Array(), nsec: '', pk: '', npub: '' });
  const router = useRouter()

  useEffect(() => {
    const storedKeys = localStorage.getItem('keyPair')
    if (storedKeys) {
      setKeyPair(JSON.parse(storedKeys))
    } 
  }, [])


  return (
    <AuthContext.Provider value={{ keyPair, setKeyPair }}>
      {children}
    </AuthContext.Provider>
  );
}
