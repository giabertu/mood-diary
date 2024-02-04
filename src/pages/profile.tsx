import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";

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

      const actualEvents = await NostrService.getProfileEvents(keyPair.pk)
      const actualProfile = await NostrService.getProfileInfo(keyPair.pk)
      console.log({ actualProfile })
      setProfile(JSON.parse(actualProfile[0]?.content))
      console.log({ actualEvents })
      const userRelays = await NostrService.getProfileRelays(keyPair.pk)
      console.log({ relays: JSON.parse(userRelays[0].content) })
      console.log({kind3 : userRelays})
      const followers = await NostrService.getProfileFollowers(keyPair.pk)
      console.log({ followers })
      const following = await NostrService.getProfileFollowing(keyPair.pk)
      console.log({ following })
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      <div className="border border-gray-300 h-full p-2">
        <div className="flex flex-col justify-between gap-1">
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

          <h1 className=" font-bold text-lg ">{profile.display_name}</h1>
          <div className="flex gap-2 text-sm text-gray-500 items-center">
            <p>{keyPair.npub.slice(0, 8) + '...' + keyPair.npub.slice(-5)}</p>
            <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.npub)} className="h-4 w-4" />
          </div>

          <p className="text-sm">I love being outside and drinking sunlight. I dislike wearing shoes. Host of #AnotherFuckingBitcoinPodcast https://bitcoinpodcast.net/ Creator of The Nostrich, #Footstr, & #StopThePresses 🛑 Popularized #Zapvertising ⚡️ Bitcoin & Nostr give me hope.</p>
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