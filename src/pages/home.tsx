import { useSkContext } from "@/app/context/secretKeyContext";
import { NostrService } from "@/app/services/NostrService";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { Event } from 'nostr-tools'
import Post from "@/app/components/post";





function Home() {

  const { keyPair, following, setKeyPair } = useSkContext()
  const [feed, setFeed] = useState<Event[]>([])


  useEffect(() => {
    async function getFeed() {
      const posts = await NostrService.getFeed(following);
      console.log({ posts })
      setFeed(posts)
    }
    if (following.length > 0) {
      getFeed()
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