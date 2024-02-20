import { UserProfile } from "@/pages/profile";
import { getDate } from "../globals";
import { Event } from 'nostr-tools'
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { NostrService } from "../services/NostrService";
import Attachment from "./attachment";
import { PostponedPathnameNormalizer } from "next/dist/server/future/normalizers/request/postponed";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { constants } from "crypto";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useSkContext } from "../context/secretKeyContext";

type PostProps = {
  post: Event,
  profile: UserProfile | null,
  addBorder?: boolean,
}



function Post({ post, profile, addBorder = true }: PostProps) {

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


  const [hidePost, setHidePost] = useState<boolean>(false) //if a repost is untoggled in profile or user tabs (not post or home feed)


  const isRepost = post.kind === 6;
  const ogPost = isRepost ? JSON.parse(post.content) : post;
  const showReplies = router.asPath.includes('post')

  const { keyPair } = useSkContext()


  // Event handler for clicking the username
  const handleUsernameClick = (pubkey: string, profileName: string) => {
    localStorage.setItem('userInfo', JSON.stringify({ profile: newProfile, pubKey: ogPost.pubkey }))
    router.push(`/user/${nip19.npubEncode(pubkey)}`, `/user/${profileName}`);
  };

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
          const ogProf = await NostrService.getProfileInfo(ogPost.pubkey) // get the original profile of the reposted post
          const parsedOgProf = JSON.parse(ogProf[0]?.content)
          setNewProfile({ ...parsedOgProf, created_at: ogProf[0]?.created_at })
          setReposterProfile(profile)
        } else {
          const [ogProf, repProf] = await Promise.all([
            NostrService.getProfileInfo(ogPost.pubkey),
            NostrService.getProfileInfo(post.pubkey)
          ])
          const parsedOgProf = JSON.parse(ogProf[0]?.content)
          const parsedRepProf = JSON.parse(repProf[0]?.content)
          setNewProfile({ ...parsedOgProf, created_at: ogProf[0]?.created_at })
          setReposterProfile({ ...parsedRepProf, created_at: repProf[0]?.created_at })
        }
      } else {
        if (profile) {
          setNewProfile(profile)
        } else {
          const prof = await NostrService.getProfileInfo(ogPost.pubkey)
          const parsedProfile = JSON.parse(prof[0]?.content)
          setNewProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
        }
      }

    }
    getProfile()
  }, [])

  useEffect(() => {
    async function getPostInfo() {
      const postEng = await NostrService.getPostEngagement(ogPost.id)
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


  if (hidePost) return null


  return (
    <div className={`flex flex-col gap-2 py-4 px-2 min-w-full ${addBorder ? "border border-gray-300 border-t-0 border-x-0" : ""}`}>
      {isRepost && reposterProfile && <p className="text-gray-500 flex gap-2 items-center"
        onClick={(e) => {
          e.stopPropagation();
          if (reposterProfile) {
            localStorage.setItem('userInfo', JSON.stringify({ profile: reposterProfile, pubKey: post.pubkey }))
            router.push(`/user/${nip19.npubEncode(post.pubkey)}`, `/user/${reposterProfile.name}`);
          }
        }}><ArrowPathRoundedSquareIcon className="w-6" /> <span>by {reposterProfile?.display_name}</span></p>}
      <div className="flex gap-2 w-full">
        <div className="w-12 h-12 rounded-full flex-shrink-0 justify-self-center overflow-hidden">
          <img
            src={newProfile && newProfile.picture ? newProfile.picture : `/icon.svg`}
            alt="profile picture"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col w-full">
          <div className="flex gap-2 text-sm w-full justify-between">
            <div className="flex gap-2 hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              newProfile && handleUsernameClick(ogPost.pubkey, newProfile.name);
            }}>
              <p className="font-bold">{newProfile && newProfile.display_name}</p>
              <p className="text-gray-500">{newProfile && newProfile.name}</p>
            </div>
            <p className="justify-self-end text-gray-500">{getDate(ogPost.created_at)}</p>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} onClick={() => router.push(`/post/${ogPost.id}`)}>{content}</p>
          <Attachment urls={urls} />
          <div className="flex gap-8 p-2 text-gray-500 w-full">
            <p className="flex gap-2 items-center">{postReactions.length}
              <button onClick={() => toggleLikePost(post.id, post.pubkey)}>{liked ? <HeartSolid className="w-4 text-purple-500" /> : <HeartOutline className="w-4" />}</button>
            </p>
            <p className="flex gap-2 items-center">{postReposts.length}
              <button onClick={() => toggleRepost(post)} >{reposted ? <ArrowPathRoundedSquareIcon className="w-4 text-purple-500" /> : <ArrowPathRoundedSquareIcon className="w-4" />}</button>
            </p>
            <p className="flex gap-2 items-center">{postReplies.length} {commented ? <ChatBubbleBottomCenterIcon className="w-4 text-purple-500" /> : <ChatBubbleBottomCenterIcon className="w-4" />} </p>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Post;