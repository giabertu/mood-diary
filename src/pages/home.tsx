import { useSkContext } from "@/app/context/secretKeyContext";
import { NostrService } from "@/app/services/NostrService";
import { useEffect, useRef, useState } from "react";
import { Event, SubCloser } from 'nostr-tools'
import Post from "@/app/components/post";
import PostCreator from "@/app/components/postCreator";
import { pool } from "@/app/services/utils";
import { DEFAULT_RELAYS } from "@/app/globals";
import { UserProfile } from "./profile";
import { ArrowUpIcon } from "@heroicons/react/24/outline";





function Home() {

  const { keyPair, following, setKeyPair, profile, profilesCache, setProfilesCache, setFollowing } = useSkContext()
  const [feed, setFeed] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostsCache, setNewPostsCache] = useState<Event[]>([])
  const [newPostsPics, setNewPostsPics] = useState<string[]>([])

  const feedRef = useRef(feed)


  useEffect(() => {
    feedRef.current = feed
  }, [feed])


  useEffect(() => {
    console.log("running useEffect in home")

    async function getFeed(getFollowing: boolean = false) {
      if (getFollowing) {
        const following = await NostrService.getProfileFollowing(keyPair.pk)
        setFollowing(following)
      }
      if (following) {
        const posts = await NostrService.getFeed(following);
        console.log({ posts })
        setFeed(posts)
        setLoading(false)
      }
    }
    console.log({ following, keyPair, profile })
    if (following && following.length > 0) { //if we have a following list, then we can get the feed
      getFeed()
    } else if (!following && profile.name) { //if following is null, but profile is not, then we need to get the following list
      getFeed(true)
    }
  }, [following])


  useEffect(() => {
    let h: SubCloser;
    if (following) {
      h = pool.subscribeMany(
        DEFAULT_RELAYS,
        [
          {
            kinds: [1, 6],
            authors: following,

          },
        ],
        {
          onevent(event) {
            
            // this will only be called once the first time the event is received
            console.log("Received ", event)
            if (feedRef.current.length === 0) {
              console.log('feed empty, not adding to feed')
              return //if the feed is empty, we dont want to add the post to the feed 
            }
            const now = new Date().getTime()
            if ((event.created_at * 1000) < now - (60000 * 5)) {
              console.log('event too old, not adding to feed')
              return //if the event is older than 5 minutes, we dont want to add it to the feed
            }
            if (feedRef.current.findIndex(post => event.id == post.id) > -1) {
              console.log('post already in feed')
              return //if the post is already in the feed, we dont want to add it again
            }
            if (event.kind === 6) {
              console.log('repost, adding to cache')
              setNewPostsCache((prev) => {
                return [event, ...prev]
              })
              return
            } else {
              for (let i = 0; i < event.tags.length; i++) {
                if (event.tags[i].includes('e')) {
                  console.log('reply, not adding to cache')
                  return //its a reply, we dont want to show replies in the feed
                }
              }
              console.log('new post, adding to cache', event)
              setNewPostsCache((prev) => {
                return [event, ...prev]
              })
            }
          },
        }
      )
    }
    return () => {
      if (h) {
        h.close();
      }
    };
  }, [following])

  console.log({ newPostsCache })


  useEffect(() => {
    if (newPostsCache.length === 0 || profilesCache === null) return
    const updateNewPostsPics = async () => {
      if (profilesCache.has(newPostsCache[0].pubkey)) {
        setNewPostsPics((prev: string[]) => {
          let newPic = profilesCache.get(newPostsCache[0].pubkey)?.picture ? profilesCache.get(newPostsCache[0].pubkey)!.picture : `/icon.svg`
          return [newPic, ...prev]
        })
      } else {
        const prof = await NostrService.getProfileInfo([newPostsCache[0].pubkey])
        if (prof[0]?.content) {
          const parsedProfile: UserProfile = JSON.parse(prof[0]?.content)
          setProfilesCache((prev) => {
            const newCache = new Map<string, UserProfile>(prev)
            newCache.set(newPostsCache[0].pubkey, parsedProfile)
            return newCache
          })
          setNewPostsPics((prev: string[]) => {
            let newPic = parsedProfile.picture ? parsedProfile.picture : `/icon.svg`
            return [newPic, ...prev]
          })
        }
      }
    }
    updateNewPostsPics()

  }, [newPostsCache])




  if (loading) {
    return (
      <div>
        <PostCreator feedSetter={setFeed} />
        <div className="flex flex-col w-full">
          {feed.length === 0 && <div className="text-center text-gray-500 w-full flex items-center justify-center h-full  min-h-48">
            <img src="/loading.svg" alt="" />
          </div>
          }
        </div>
      </div>
    );

  }




  return (
    <div>
      <PostCreator feedSetter={setFeed} />
      {/* feed */}
      <div className="flex flex-col w-full relative">
        {(newPostsCache.length > 0) && <button
          style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }}
          onClick={() => {
            setFeed([...newPostsCache, ...feed])
            setNewPostsCache([])
            setNewPostsPics([])
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="top-10 left-[45%] sticky w-fit p-2 px-4 rounded-full z-10 flex items-center">
          <ArrowUpIcon className="w-6 mr-2 text-white" />
          {newPostsPics.slice(0, 3).map(pic => <div className={`h-8 w-8 rounded-full flex-shrink-0 justify-self-center overflow-hidden`}>
            <img
              src={pic}
              alt="profile picture"
              className={`w-full h-full object-cover`}
            />
          </div>)}
        </button>}
        {feed.map((post, i) => <Post key={post.id} post={post} profile={null} addBorder={i !== feed.length - 1} />)}
        {feed.length === 0 && <div className="text-center text-gray-500 w-full flex items-center justify-center h-full  min-h-48">
          <p>No posts to show, consider following new users</p>
        </div>
        }
      </div>
    </div>
  );
}

export default Home;