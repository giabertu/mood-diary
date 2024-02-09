import { UserProfile } from "@/pages/profile";
import { getDate } from "../globals";
import { Event } from 'nostr-tools'
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";

type PostProps = {
  post: Event,
  profile: UserProfile,
  addBorder?: boolean,
}



function Post({ post, profile, addBorder = true }: PostProps) {


  const router = useRouter()


  return (
    <div className={`flex gap-2 py-4 px-2 cursor-pointer  ${addBorder && "border border-gray-300 border-t-0 border-x-0"}`} onClick={() => router.push(`/post/${post.id}`)}>
      <div className="w-12 h-12 rounded-full flex-shrink-0 justify-self-center overflow-hidden ">
        <img
          src={profile && profile.picture ? profile.picture : `/icon.svg`}
          alt="profile picture"
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <div className="flex flex-col  flex-grow">
        <div className="flex gap-2 text-sm flex-grow justify-between ">
          <div className="flex gap-2">
            <p className="font-bold hover:underline cursor-pointer" onClick={() => router.push(`/user/${nip19.npubEncode(post.pubkey)}`, `/user/${profile && profile.name}`)}>{profile && profile.display_name}</p>
            <p className="text-gray-500">{profile && profile.name}</p>
          </div>
          <p className=" justify-self-end text-gray-500">{getDate(post.created_at)}</p>
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
      </div>
    </div>
  )


}

export default Post;