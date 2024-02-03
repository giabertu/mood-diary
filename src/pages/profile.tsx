import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import Image from 'next/image'

type UserProfile = {
  banner: string;
  website: string;
  lud06: string;
  nip05: string;
  picture: string;
  lud16: string;
  display_name: string;
  about: string;
  name: string;
}

const DEFAULT_PROFILE: UserProfile = {
  banner: '',
  website: '',
  lud06: '',
  nip05: '',
  picture: '',
  lud16: '',
  display_name: '',
  about: '',
  name: '',
}


function Profile() {

  const { keyPair, setKeyPair } = useSkContext()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      // const events = await NostrService.getProfileEvents('72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141')
      const actualEvents = await NostrService.getProfileEvents(keyPair.pk)
      // const profile = await NostrService.getProfileInfo('72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141')
      const actualProfile = await NostrService.getProfileInfo(keyPair.pk)
      console.log({ actualProfile })
      setProfile(JSON.parse(actualProfile[0]?.content))
      console.log({ actualEvents })
    }
    if (keyPair.pk) {
      getProfile()
    }
  }, [keyPair])


  useEffect(() => {
    if (localStorage.getItem('keyPair') === null) {
      setKeyPair(DEFAULT_KEYPAIR)
      router.push('/signin')
    }
  }, [])

  return (
    <>
      <div className="border border-gray-300 h-full p-2">
        <div>
          <div className="relative flex flex-col debug">
            <img src={profile.banner ? profile.banner : `/banner.jpg`} alt="banner" className="w-full" />
            <div className="w-36 h-36 rounded-full justify-self-center absolute bottom-2 overflow-hidden flex items-center justify-center">
              <img
                src={profile.picture ? profile.picture : `/icon.svg`}
                alt="profile picture"
                className="absolute w-full h-full object-cover"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />

            </div>
            <div className="flex justify-end items-center debug w-full min-h-20">
              <button className="border border-gray-300 rounded-3xl p-2">edit profile</button>
            </div>
          </div>
          <h1>{profile.display_name}</h1>
          <p>{profile.about}</p>
        </div>
        <h1>Profile</h1>
        {/* {keyPair && <p>KeyPair: {JSON.stringify(keyPair)}</p>} */}
        <button onClick={() => {
          localStorage.removeItem('keyPair')
          setKeyPair(DEFAULT_KEYPAIR)
          router.push('/signin')

        }}>
          Sign out
        </button>
      </div>
    </>
  )

}

export default Profile


// avatar-${Math.floor(Math.random()*2 + 1)}.webp