import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { randomInt } from "crypto";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";

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
    if (keyPair.pk){
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
      <div className="border border-gray-300 p-2">
        <div>
          <img src={profile.picture ? profile.picture : `/avatar-${Math.floor(Math.random()*2 + 1)}.webp`} alt="profile picture" className="w-20 rounded-full" />
          <h1>{profile.display_name}</h1>
          <p>{profile.about}</p>
        </div>
        <h1>Profile</h1>
        {keyPair && <p>KeyPair: {JSON.stringify(keyPair)}</p>}
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