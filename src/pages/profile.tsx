import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, getDate, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Event } from 'nostr-tools'
import Post from "@/app/components/post";

export type UserProfile = {
  banner: string;
  website: string;
  lud06: string;
  nip05: string;
  picture: string;
  lud16: string;
  display_name: string;
  about: string;
  name: string;
  created_at: number;
}

const DEFAULT_PROFILE: UserProfile = {
  banner: '',
  website: '',
  lud06: '',
  nip05: '',
  picture: '',
  lud16: '',
  display_name: 'Satoshi Nakamoto',
  about: 'Read my whitepaper',
  name: 'satoshi',
  created_at: 0
}


function Profile() {

  const { keyPair, setKeyPair } = useSkContext()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [posts, setPosts] = useState<Event[]>([])
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {

      const actualProfile = await NostrService.getProfileInfo(keyPair.pk)
      console.log({ actualProfile })
      const parsedProfile = JSON.parse(actualProfile[0]?.content)
      setProfile({ ...parsedProfile, created_at: actualProfile[0]?.created_at })
      const userRelays = await NostrService.getProfileRelays(keyPair.pk)
      console.log({ relays: JSON.parse(userRelays[0].content) })
      console.log({ kind3: userRelays })
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
      <div className="border border-gray-300 h-full p-2  flex flex-col gap-2">
        <div className="flex flex-col justify-between gap-1">
          <div className="relative flex flex-col ">
            <img src={profile.banner ? profile.banner : `/banner.jpg`} alt="banner" className="w-full" />
            <div className="w-36 h-36 rounded-full justify-self-center absolute bottom-2 overflow-hidden flex items-center justify-center">
              <img
                src={profile.picture ? profile.picture : `/icon.svg`}
                alt="profile picture"
                className="absolute w-full h-full object-cover"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div className="flex justify-end items-center  w-full min-h-20">
              <button className="border border-gray-300 rounded-3xl p-2">edit profile</button>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex gap-4 items-center">
              <h1 className=" font-bold text-lg ">{profile.display_name}</h1>
              <p className="text-gray-500">{profile.name}</p>
            </div>
            <p className="text-gray-500 text-sm">{"joined " + getDate(profile.created_at)}</p>
          </div>
          <div className="flex gap-2 text-sm text-gray-500 items-center">
            <p>{keyPair.npub.slice(0, 8) + '...' + keyPair.npub.slice(-5)}</p>
            <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.npub)} className="h-4 w-4" />
          </div>

          <p className="text-sm" style={{ whiteSpace: "pre-line" }}>{profile.about}</p>
        </div>

        {/* feed */}
        <div className="flex flex-col w-full">
          {posts.map((post, i) => <Post post={post} profile={profile} addBorder={i !== posts.length - 1}/>)}
        </div>
      </div>
    </>
  )

}

export default Profile


// avatar-${Math.floor(Math.random()*2 + 1)}.webp