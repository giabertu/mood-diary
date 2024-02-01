

// AuthContext.js
import React, { createContext, useState, useContext, ReactNode, SetStateAction, Dispatch} from 'react';
import { KeyPair } from '../services/NostrService';

const AuthContext = createContext({keyPair: {sk: new Uint8Array(), nsec: '', pk: '', npub: ''}, setKeyPair: (keypair: KeyPair) => {}});

export function useSkContext() {
  return useContext(AuthContext);
}


type SecretKeyProviderProps = {
  children: ReactNode;
};

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [keyPair, setKeyPair] = useState({sk: new Uint8Array(), nsec: '', pk: '', npub: ''});



  return (
    <AuthContext.Provider value={{keyPair, setKeyPair}}>
      {children}
    </AuthContext.Provider>
  );
}
