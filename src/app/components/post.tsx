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

  const isRepost = post.kind === 6;
  const ogPost = isRepost ? JSON.parse(post.content) : post;

  if (isRepost) {
    console.log("repost ", post)
  }

  // Event handler for clicking the username
  const handleUsernameClick = (pubkey: string, profileName: string) => {
    localStorage.setItem('userInfo', JSON.stringify({ profile: newProfile, pubKey: post.pubkey }))
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
        if (profile){
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
        const prof = await NostrService.getProfileInfo(ogPost.pubkey)
        const parsedProfile = JSON.parse(prof[0]?.content)
        setNewProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
      }

    }
    getProfile()
  }, [])



  return (
    <div className={`flex flex-col gap-2 py-4 px-2 cursor-pointer min-w-full ${addBorder ? "border border-gray-300 border-t-0 border-x-0" : ""}`} onClick={() => router.push(`/post/${ogPost.id}`)}>
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
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content}</p>
        </div>
      </div>
      <Attachment urls={urls} />
    </div>
  );

}

export default Post;