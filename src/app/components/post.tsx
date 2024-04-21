import { UserProfile } from "@/pages/profile";
import { getDate } from "../globals";
import { Event } from 'nostr-tools'
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { NostrService } from "../services/NostrService";
import Attachment from "./attachment";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useSkContext } from "../context/secretKeyContext";

import { parseReferences } from 'nostr-tools/references'


type PostProps = {
  post: Event,
  profile: UserProfile | null,
  addBorder?: boolean,
  kind?: "post" | "comment" | "reply"
  OP?: UserProfile | null
}



function Post({ post, profile, addBorder = true, kind = "post", OP }: PostProps) {

  const router = useRouter()
  const [newProfile, setNewProfile] = useState<UserProfile | null>(null)
  const [reposterProfile, setReposterProfile] = useState<UserProfile | null>(null)
  const [urls, setUrls] = useState<string[]>([])
  const [content, setContent] = useState<string>("")
  const [postReplies, setPostReplies] = useState<Event[]>([])
  const [postReactions, setPostReactions] = useState<Event[]>([])
  const [postReposts, setPostReposts] = useState<Event[]>([])
  const [liked, setLiked] = useState<boolean>(false)
  const [reposted, setReposted] = useState<boolean>(false)
  const [commented, setCommented] = useState<boolean>(false)
  const [showReplies, setShowReplies] = useState<boolean>(kind == 'post')


  const [hidePost, setHidePost] = useState<boolean>(false) //if a repost is untoggled in profile or user tabs (not post or home feed)


  const isRepost = post.kind === 6;
  const ogPost = isRepost ? JSON.parse(post.content) : post;
  const { keyPair, profilesCache, setProfilesCache } = useSkContext()

  // console.log({ post, kind, isRepost, ogPost })

  useEffect(() => {
    if (ogPost.content.includes('https://')) {
      const index = ogPost.content.indexOf('https://')
      setContent(ogPost.content.slice(0, index))
      const urls = ogPost.content.slice(index).split(' ').filter((url: string) => url !== '').map((url: string) => url.trim().split("#")[0])
      setUrls(urls)
    } else {
      setContent(ogPost.content)
    }

    async function getProfile() {
      if (isRepost) {
        if (profile) {
          if (profilesCache && profilesCache.has(ogPost.pubkey)) {
            const cachedProfile = profilesCache.get(ogPost.pubkey)
            cachedProfile && setNewProfile(cachedProfile)
            setReposterProfile(profile)
          } else {
            console.log("Fetching pk profile", ogPost.pubkey, "because: ", profilesCache?.get(ogPost.pubkey))
            const ogProf = await NostrService.getProfileInfo([ogPost.pubkey]) // get the original profile of the reposted post
            if (ogProf[0]?.content) {
              const parsedOgProf = JSON.parse(ogProf[0]?.content)
              setNewProfile(parsedOgProf)
              setProfilesCache((prev) => {
                const newCache = new Map<string, UserProfile>(prev)
                newCache.set(ogPost.pubkey, parsedOgProf)
                return newCache
              })
            } else {
              console.error("Profile not found", { isRepost, post, ogPost, ogProf })
            }
            setReposterProfile(profile)
          }
        } else {
          if (profilesCache) {
            if (profilesCache.has(ogPost.pubkey)) {
              const cachedProfile = profilesCache.get(ogPost.pubkey)
              cachedProfile && setNewProfile(cachedProfile)
            } else {
              console.log("Fetching pk profile", ogPost.pubkey, "because: ", profilesCache?.get(ogPost.pubkey))
              const ogProf = await NostrService.getProfileInfo([ogPost.pubkey])
              if (ogProf[0]?.content) {
                const parsedOgProf: UserProfile = JSON.parse(ogProf[0]?.content)
                setNewProfile(parsedOgProf)
                setProfilesCache((prev) => {
                  const newCache = new Map<string, UserProfile>(prev)
                  newCache.set(ogPost.pubkey, parsedOgProf)
                  return newCache
                })
              } else {
                console.error("Profile not found", { isRepost, post, ogPost, ogProf })
              }
            } 
            if (profilesCache.has(post.pubkey)) {
              const cachedProfile = profilesCache.get(post.pubkey)
              cachedProfile && setReposterProfile(cachedProfile)
            } else {
              console.log("Fetching pk profile", post.pubkey, "because: ", profilesCache?.get(post.pubkey))
              const repProf = await NostrService.getProfileInfo([post.pubkey])
              if (repProf[0]?.content) {
                const parsedRepProf: UserProfile = JSON.parse(repProf[0]?.content)
                setReposterProfile(parsedRepProf)
                setProfilesCache((prev) => {
                  const newCache = new Map<string, UserProfile>(prev)
                  newCache.set(post.pubkey, parsedRepProf)
                  return newCache
                })
              } else {
                console.error("Profile not found", { isRepost, post, ogPost, repProf })
              }
            }
          }
        }
      } else {
        if (profile) {
          setNewProfile(profile)
        } else {
          if (profilesCache && profilesCache.has(ogPost.pubkey)) {
            const cachedProfile = profilesCache.get(ogPost.pubkey)
            cachedProfile && setNewProfile(cachedProfile)
          } else {
            const prof = await NostrService.getProfileInfo([ogPost.pubkey])
            if (prof[0]?.content) {
              const parsedProfile: UserProfile = JSON.parse(prof[0]?.content)
              setNewProfile(parsedProfile)
              setProfilesCache((prev) => {
                const newCache = new Map<string, UserProfile>(prev)
                newCache.set(ogPost.pubkey, parsedProfile)
                return newCache
              })
            } else {
              console.error("Profile not found", { isRepost, post, ogPost })
            }
          }
        }
      }

    }
    getProfile()
  }, [])

  useEffect(() => {
    async function getPostInfo() {
      const postEng = await NostrService.getPostEngagement(ogPost.id)
      // console.log("Here is post eng ", { postEng })
      setPostReplies(postEng.replies)
      setPostReactions(postEng.reactions)
      setPostReposts(postEng.reposts)
      if (postEng.reactions.some(reaction => reaction.pubkey === keyPair.pk)) {
        setLiked(true)
      }
      if (postEng.reposts.some(repost => repost.pubkey === keyPair.pk)) {
        setReposted(true)
      }
      if (postEng.replies.some(reply => reply.pubkey === keyPair.pk)) {
        setCommented(true)
      }
    }
    if (post) {
      getPostInfo()
    }
  }, [post])


  if (postReplies.length > 0 && kind === 'post') {
    // console.log({ postId: post.id, postReplies })
  }


  const toggleLikePost = async (eId: string, ePk: string) => {
    if (liked) {
      // unlike post
      const likeEID = postReactions.find(reaction => reaction.pubkey === keyPair.pk)?.id
      console.log("Here is the like Event Id ", { likeEID })
      if (likeEID) {
        await NostrService.deleteEvent(likeEID, keyPair, "unlike post")
        setLiked(false)
        setPostReactions(prev => prev.filter(reaction => reaction.pubkey !== keyPair.pk))
      } else {
        console.error("LikeEID not found - CANNOT UNLIKE POST")
      }
    } else {
      // like post
      const e = await NostrService.likePost(eId, ePk, keyPair)
      const postEng = await NostrService.getPostEngagement(ogPost.id)
      setLiked(true)
      setPostReactions(postEng.reactions)
    }
  }


  const toggleRepost = async (ogE: Event) => {
    if (reposted) {
      // un-repost
      const repostEID = postReposts.find(repost => repost.pubkey === keyPair.pk)?.id
      if (repostEID) {
        await NostrService.deleteEvent(repostEID, keyPair, "unrepost event")
        setReposted(false)
        setPostReposts(prev => prev.filter(repost => repost.pubkey !== keyPair.pk))
        if (router.asPath.includes('profile') || router.asPath.includes('user')) {
          setHidePost(true)
        }
      } else {
        console.error("RepostEID not found - CANNOT UNREPOST")
      }
    } else {
      // repost
      const e = await NostrService.repostPost(ogE, keyPair)
      const postEng = await NostrService.getPostEngagement(ogPost.id)
      setReposted(true)
      setPostReposts(postEng.reposts)
    }


  }
  // let references = parseReferences(ogPost)
  // console.log({ references })
  // let simpleAugmentedContent = ogPost.content
  // for (let i = 0; i < references.length; i++) {
  //   let { text, profile, event, address } = references[i]
  //   console.log({ text, profile, event, address })
  //   let augmentedReference = profile
  //     ? `<strong>@${'YO'}</strong>`
  //     : event
  //       ? `<em>${"yo"}</em>`
  //       : address
  //         ? `<a href="${text}">[link]</a>`
  //         : text
  //   console.log({ augmentedReference })
  //   simpleAugmentedContent.replaceAll(text, augmentedReference)
  // }

  // console.log({ simpleAugmentedContent })

  if (hidePost) return null


  return (
    <>
      <div className={`
      flex flex-col gap-2 py-4 px-2 ${kind === 'reply' && 'px-6 py-2'} min-w-full ${addBorder ? "border border-gray-400 border-t-0 border-x-0" : ""}`}>
        {isRepost && reposterProfile && <p className="text-gray-500 flex gap-2 items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (reposterProfile) {
              router.push(`/user/${nip19.npubEncode(post.pubkey)}`);
            }
          }}><ArrowPathRoundedSquareIcon className="w-6" /> <span>by {reposterProfile?.display_name}</span></p>}
        <div className="flex gap-2 w-full">
          <div className={`${kind === 'reply' ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex-shrink-0 justify-self-center overflow-hidden`}>
            <img
              src={newProfile && newProfile.picture ? newProfile.picture : `/icon.svg`}
              alt="profile picture"
              className={`w-full h-full object-cover`}
            />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex gap-2 text-sm w-full justify-between">
              <div className="flex gap-2 hover:underline cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                newProfile && router.push(`/user/${nip19.npubEncode(ogPost.pubkey)}`);
              }}>
                <p className="font-bold">{newProfile && newProfile.display_name}</p>
                <p className="text-gray-500">{newProfile && newProfile.name}</p>
              </div>
              <p className="justify-self-end text-gray-500">{getDate(ogPost.created_at)}</p>
            </div>
            {kind !== "post" && <div className="flex gap-2 text-sm text-gray-500 w-full">replying to<span className="text-purple-500">{OP?.display_name}</span></div>}
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} onClick={() => router.push(`/post/${ogPost.id}`)}>{content}</p>
            <Attachment urls={urls} />
            <div className="flex gap-8 p-2 text-gray-500 w-full">
              <p className="flex gap-2 items-center">{postReactions.length}
                <button onClick={() => toggleLikePost(post.id, post.pubkey)}>{liked ? <HeartSolid className="w-4 text-purple-500" /> : <HeartOutline className="w-4" />}</button>
              </p>
              <p className="flex gap-2 items-center">{postReposts.length}
                <button onClick={() => toggleRepost(ogPost)} >{reposted ? <ArrowPathRoundedSquareIcon className="w-4 text-purple-500" /> : <ArrowPathRoundedSquareIcon className="w-4" />}</button>
              </p>
              <p className="flex gap-2 items-center">{postReplies.length} {commented ? <ChatBubbleBottomCenterIcon className="w-4 text-purple-500" /> : <ChatBubbleBottomCenterIcon className="w-4" />} {kind !== 'post' && postReplies.length > 0 && <button onClick={() => setShowReplies(prev => !prev)} className="text-xs text-gray-500">{showReplies ? "hide" : "show"} replies</button>}</p>
            </div>
          </div>
        </div>
      </div>
      {(showReplies && router.asPath.includes("post") && postReplies.length > 0) && <div className="flex flex-col gap-2 p-2">
        {postReplies.filter(reply => {
          // to implement...
          // handle differently depending on post, comment, reply?
          // if (kind === "post")  just show comments
          // if (kind === comment or reply) show ALL replies
          if (kind === 'comment' || kind === 'reply') return true
          let count = 0;
          let eCache: string[] = []
          reply.tags.forEach(tag => {
            
            if (tag[0] == 'e' && !eCache.includes(tag[0])) {
              eCache.push(tag[0])
              count++
            }
          })
          return count === 1
        }).map((reply, i) => <Post
          key={reply.id}
          kind={kind === "post" ? "comment" : "reply"}
          OP={newProfile}
          post={reply}
          profile={null}
          addBorder={i !== postReplies.length - 1} />)}
      </div>
      }
    </>
  );

}

export default Post;