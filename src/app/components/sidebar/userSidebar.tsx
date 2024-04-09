
import { useSkContext } from "@/app/context/secretKeyContext";
import { NostrService } from "@/app/services/NostrService";
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";



function UserSidebar() {

  const [loading, setLoading] = useState(true);
  const [currentUserPk, setCurrentUserPk] = useState<string>("")
  const [following, setFollowing] = useState<string[] | null>(null)
  const [followers, setFollowers] = useState<string[] | null>(null)

  const router = useRouter()

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
        const [following, followers] = await Promise.all([
          NostrService.getProfileFollowing(pk),
          NostrService.getProfileFollowers(pk)
        ])
        console.log({ following, followers })
        setFollowing(following)
        setFollowers(followers)
        setLoading(false)
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


  return (
    <div className='w-1/4 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
        <p
            className='text-lg font-semibold p-2 flex gap-2 items-center justify-center
        backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
        '>Follwers count: <span className={`flex-shrink-0 ${following && "border border-gray-700" } py-[0.1rem] px-[0.2rem] rounded-md`}>
          {followers ? followers.length : <img src="/loading.svg" className="w-8 inline flex-shrink-0"/>}</span></p>
          <p
            className='text-lg font-semibold p-2 flex gap-2 items-center justify-center
        backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
        '>Following count: <span className={`flex-shrink-0 ${following && "border border-gray-700" } py-[0.1rem] px-[0.2rem] rounded-md`}>
          {following ? following.length : <img src="/loading.svg" className="w-8 inline flex-shrink-0"/>}</span></p>
        </div>
      </div>
    </div>
  )



}


export default UserSidebar;