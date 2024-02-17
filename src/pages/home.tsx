import { useSkContext } from "@/app/context/secretKeyContext";
import { NostrService } from "@/app/services/NostrService";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { Event } from 'nostr-tools'
import Post from "@/app/components/post";
import { get } from "http";





function Home() {

  const { keyPair, following, setKeyPair, profile, setFollowing} = useSkContext()
  const [feed, setFeed] = useState<Event[]>([])


  useEffect(() => {
    console.log("running useEffect in home")
    async function getFeed(getFollowing: boolean = false) {
      if (getFollowing) {
        const following = await NostrService.getProfileFollowing(keyPair.pk)
        setFollowing(following)
      }
      const posts = await NostrService.getFeed(following);
      console.log({ posts })
      setFeed(posts)
    }
    console.log({ following, keyPair, profile})
    if (following.length > 0) {
      getFeed()
    } else if (following.length === 0 && profile.name){
      getFeed(true)
    }
  }, [following])




  return (
    <div>
      <h1>Home</h1>

      {/* feed */}
      <div className="flex flex-col w-full">
        {feed.map((post, i) => <Post key={post.id} post={post} profile={null} addBorder={i !== feed.length - 1} />)}
      </div>
    </div>
  );
}

export default Home;