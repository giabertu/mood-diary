import { useSkContext } from "@/app/context/secretKeyContext";
import { NostrService } from "@/app/services/NostrService";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { Event } from 'nostr-tools'
import Post from "@/app/components/post";





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
      if (following){
        const posts = await NostrService.getFeed(following);
        console.log({ posts })
        setFeed(posts)
      }
    }
    console.log({ following, keyPair, profile})
    if (following && following.length > 0) { //if we have a following list, then we can get the feed
      getFeed()
    } else if (!following && profile.name){ //if following is null, but profile is not, then we need to get the following list
      getFeed(true)
    }
  }, [following])




  return (
    <div>
      {/* feed */}
      <div className="flex flex-col w-full">
        {feed.map((post, i) => <Post key={post.id} post={post} profile={null} addBorder={i !== feed.length - 1} />)}
      </div>
    </div>
  );
}

export default Home;