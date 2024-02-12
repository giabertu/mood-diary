import { UserProfile } from "@/pages/profile";
import { getDate } from "../globals";
import { Event } from 'nostr-tools'
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { NostrService } from "../services/NostrService";

type PostProps = {
  post: Event,
  profile: UserProfile | null,
  addBorder?: boolean,
}



function Post({ post, profile, addBorder = true }: PostProps) {


  const router = useRouter()
  const [newProfile, setNewProfile] = useState<UserProfile | null>(null)

  // Event handler for clicking the username
  const handleUsernameClick = (pubkey: string, profileName: string) => {
    router.push(`/user/${nip19.npubEncode(pubkey)}`, `/user/${profileName}`);
  };

  useEffect(() => {

    async function getProfile() {
      if (profile) {
        setNewProfile(profile)
      } else {
        const prof = await NostrService.getProfileInfo(post.pubkey)
        const parsedProfile = JSON.parse(prof[0]?.content)
        setNewProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
      }
    }
    getProfile()
  }, [])


  return (
    <div className={`flex gap-2 py-4 px-2 cursor-pointer min-w-full ${addBorder ? "border border-gray-300 border-t-0 border-x-0" : ""}`} onClick={() => router.push(`/post/${post.id}`)}>
      <div className="w-12 h-12 rounded-full flex-shrink-0 justify-self-center overflow-hidden">
        <img
          src={newProfile && newProfile.picture ? newProfile.picture : `/icon.svg`}
          alt="profile picture"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex gap-2 text-sm w-full justify-between">
          <div className="flex gap-2">
            <p className="font-bold hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              newProfile && handleUsernameClick(post.pubkey, newProfile.name);
            }}>{profile && profile.display_name}</p>
            <p className="text-gray-500">{newProfile && newProfile.name}</p>
          </div>
          <p className="justify-self-end text-gray-500">{getDate(post.created_at)}</p>
        </div>
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{post.content}</p>
      </div>
    </div>
  );

}

export default Post;