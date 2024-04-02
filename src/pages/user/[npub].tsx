import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, getDate, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Event, nip19 } from 'nostr-tools'
import Post from "@/app/components/post";
import { DEFAULT_PROFILE } from "../profile";



function UserPage() {

  const { keyPair, setKeyPair, following, setFollowing } = useSkContext()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [posts, setPosts] = useState<Event[]>([])
  const router = useRouter()
  const [currentUserPk, setCurrentUserPk] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [isFollowed, setIsFollowed] = useState<boolean>(false)

  console.log({ keyPair })

  useEffect(() => {
    if (router.query.npub) {
      if (currentUserPk !== router.query.npub as string) {
        let { data: pk } = nip19.decode(router.query.npub as string)
        pk = pk as string
        setCurrentUserPk(pk)
      }
    }
    async function getProfile() {
      if (router.query.npub) {
        console.log("I am about to fetch: ", router.query.npub)
        const npub = router.query.npub as string
        let { data: pk } = nip19.decode(npub)
        pk = pk as string
        const [prof, new_posts] = await Promise.all([
          NostrService.getProfileInfo(pk),
          NostrService.getFeed([pk])
        ])
        console.log({ new_posts })
        const parsedProfile = JSON.parse(prof[0]?.content)
        setProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
        setPosts(new_posts)
        setLoading(false)
        console.log({ new_posts, prof })
      }
    }
    getProfile()

  }, [currentUserPk])

  //update the current user if the page changes
  useEffect(() => {
    if (router.query.npub && currentUserPk !== router.query.npub) {
      let { data: pk } = nip19.decode(router.query.npub as string)
      pk = pk as string
      setCurrentUserPk(pk)
      setLoading(true)
    }
  }, [router.query.npub])

  // check if the current user follows this person
  useEffect(() => {
    if (currentUserPk) {
      console.log({ currentUserPk, following })
      console.log("do i follow this person: ", following?.includes(currentUserPk))
      if (following && following.length) {
        setIsFollowed(following.includes(currentUserPk))
      }
    }
  }, [following, currentUserPk])

  const startFollowing = async () => {
    if (following) {
      const res = await NostrService.followProfile(currentUserPk, following, keyPair)
      setFollowing([...following, currentUserPk])
      setIsFollowed(true)
    }
  }

  const stopFollowing = async () => {
    if (following) {
      const res = await NostrService.unfollowProfile(currentUserPk, following, keyPair)
      setFollowing(following.filter(pk => pk !== currentUserPk))
      setIsFollowed(false)
    }
  }

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
          <div className="w-full max-h-[20rem] overflow-hidden">
            <img src={profile.banner ? profile.banner : `/banner.jpg`} alt="banner" className="w-full object-contain" />
          </div>
          <div className="w-36 h-36 rounded-full justify-self-center absolute bottom-2 overflow-hidden flex items-center justify-center">
            <img
              src={profile.picture ? profile.picture : `/icon.svg`}
              alt="profile picture"
              className="absolute w-full h-full object-cover"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div className="flex justify-end items-center  w-full min-h-20">
            <button className="border border-gray-300 rounded-3xl p-2" onClick={() => {
              if (isFollowed) {
                stopFollowing()
              } else {
                startFollowing()
              }
            }}>{isFollowed ? "unfollow" : "follow"}</button>
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
      <div className="flex flex-col w-full h-full">
        {loading ?
          <div className="flex w-full h-full items-center justify-center">
            <img src='/loading.svg' className="w-20" />
          </div>
          : posts.map((post, i) => <Post key={post.id} post={post} profile={profile} addBorder={i !== posts.length - 1} />)}
      </div>
    </div>
  </>
)

}

export default UserPage
