

// AuthContext.js
import React, { createContext, useState, useContext, ReactNode, SetStateAction, Dispatch, useEffect } from 'react';
import { KeyPair, NostrService } from '../services/NostrService';
import { useRouter } from 'next/router';
import { DEFAULT_PROFILE, UserProfile } from '@/pages/profile';

type AuthContextType = {
  keyPair: KeyPair;
  profile: UserProfile;
  setKeyPair: (keypair: KeyPair) => void;
  setProfile: (profile: UserProfile) => void;
  following: string[] | null;
  setFollowing: (following: string[]) => void;
  followers: string[] | null;
  setFollowers: (followers: string[]) => void;

};

const AuthContext = createContext<AuthContextType>({ keyPair: { sk: new Uint8Array(), nsec: '', pk: '', npub: '' }, profile: DEFAULT_PROFILE, setKeyPair: (keypair: KeyPair) => { }, setProfile: (profile: UserProfile) => { }, following: null, setFollowing: (following: string[]) => { }, followers: null, setFollowers: (followers: string[]) => { }});

export function useSkContext() {
  return useContext(AuthContext);
}


type SecretKeyProviderProps = {
  children: ReactNode;
};

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [keyPair, setKeyPair] = useState({ sk: new Uint8Array(), nsec: '', pk: '', npub: '' });
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [following, setFollowing] = useState<string[] | null>([])
  const [followers, setFollowers] = useState<string[] | null>([])
  const router = useRouter()

  useEffect(() => {
    console.log("running useEffect in skConetxt")
    async function getState() {
      const storedKeys = localStorage.getItem('keyPair')
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys)
        setKeyPair(parsedKeys)
        console.log({parsedKeys})
        const [prof, following, followers] = await Promise.all([
          NostrService.getProfileInfo(parsedKeys.pk),
          NostrService.getProfileFollowing(parsedKeys.pk),
          NostrService.getProfileFollowers(parsedKeys.pk)
        ])
        const parsedProfile = JSON.parse(prof[0]?.content)
        setProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
        console.log({ following })
        setFollowing(following)
        console.log({ followers })
        setFollowers(followers)
      }
    }
    getState()
  }, [])


  return (
    <AuthContext.Provider value={{ keyPair, profile, following, followers, setFollowers, setFollowing, setKeyPair, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
