import Post from "@/app/components/post"
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router"
import { Event } from "nostr-tools"
import { useEffect, useState } from "react"
import { DEFAULT_PROFILE, UserProfile } from "../profile"
import { useSkContext } from "@/app/context/secretKeyContext"



function PostPage() {



  const router = useRouter()

  const [post, setPost] = useState<Event | null>(null)
  const [new_profile, setNewProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const { keyPair, profile, setProfile, setKeyPair } = useSkContext()

  const isRepost = post ? post.kind === 6 : null;
  const ogPost = post ? isRepost ? JSON.parse(post.content) : post : null;
  const showReplies = router.asPath.includes('post')




  useEffect(() => {
    async function getPost() {
      // const id = router.asPath.split('/').pop()
      const id = router.query.id
      console.log("id", id, typeof id)
      if (id && typeof id === 'string') {
        const post = await NostrService.getPost(id)
        if (post[0].pubkey === keyPair.pk) {
          console.log({ profile })
          setNewProfile(profile)
        } else {
          const new_prof = await NostrService.getProfileInfo(post[0].pubkey)
          const parsedProfile = JSON.parse(new_prof[0]?.content)
          setNewProfile({ ...parsedProfile, created_at: new_prof[0]?.created_at })
        }
        setPost(post[0])
      }
    }
    getPost()
  }, [router.query.id, profile])





  return (
    <div className="flex justify-self-start self-start flex-col gap-2 w-full h-full ">
      {post ? <Post post={post} profile={new_profile} /> : <h1>Loading</h1>}
    </div>
  )

}


export default PostPage