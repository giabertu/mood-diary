import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Event } from 'nostr-tools'

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
  const [posts, setPosts] = useState<Event[]>([])
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {

      // const actualEvents = await NostrService.getProfileEvents(keyPair.pk)
      const actualProfile = await NostrService.getProfileInfo(keyPair.pk)
      console.log({ actualProfile })
      setProfile(JSON.parse(actualProfile[0]?.content))
      // console.log({ actualEvents })
      const userRelays = await NostrService.getProfileRelays(keyPair.pk)
      console.log({ relays: JSON.parse(userRelays[0].content) })
      console.log({ kind3: userRelays })
      // const followers = await NostrService.getProfileFollowers(keyPair.pk)
      // console.log({ followers })
      // const following = await NostrService.getProfileFollowing(keyPair.pk)
      // console.log({ following })
      const new_posts = await NostrService.getProfilePosts(keyPair.pk)
      console.log({ new_posts })
      setPosts(new_posts)
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
      <div className="border border-gray-300 h-full p-2 debug flex flex-col gap-2">
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


        {/* feed */}
        {/* {
    "content": "wow primal is a great client 🧡",
    "created_at": 1702597196,
    "id": "38f7fd5f00fd46cceb48b7ba950e807f7767cb01f3ba1d99127a1325f20f5dbe",
    "kind": 1,
    "pubkey": "72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141",
    "sig": "bf6a8c87150ba2433f728e8afb0ef2cebe1b7e405073aca9695155cbb1f6b5beaf7c9806f13bef226ec5f4318f313c5c053d97b43f2ab005b25b2dd32b3b5fae",
    "tags": []
} */}
        <div className="flex flex-col w-full">
          {posts.map(post =>
            <div className="flex gap-2 p-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0 justify-self-center overflow-hidden debug">
                <img
                  src={profile.picture ? profile.picture : `/icon.svg`}
                  alt="profile picture"
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <div className="flex flex-col debug">
                <div className="flex gap-2 text-sm">
                  <p className="font-bold">{profile.display_name}</p>
                  <p className="text-gray-500">{profile.name}</p>
                  <p>{post.created_at}</p>
                </div>
                <p>{post.content}</p>
              </div>
            </div>

          )
          }

        </div>
      </div>
    </>
  )

}

export default Profile


// avatar-${Math.floor(Math.random()*2 + 1)}.webp