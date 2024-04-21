import { Dispatch, SetStateAction, useState } from "react"
import { useSkContext } from "../context/secretKeyContext"
import { PaperAirplaneIcon } from "@heroicons/react/24/solid"
import { NostrService } from "../services/NostrService"
import { Event } from 'nostr-tools'


type PostCreatorProps = {
  feedSetter: Dispatch<SetStateAction<Event[]>>
}



function PostCreator({feedSetter}: PostCreatorProps) {

  const { keyPair, setKeyPair, setProfile, profile } = useSkContext()
  const [content, setContent] = useState<string>("")


  async function publishTweet(content: string) {
    const res = await NostrService.postTweet(content, keyPair);
    console.log('res ', res);
    feedSetter((prev) => [res, ...prev])
    setContent('')
  }



  return (
    <div className="flex gap-2 w-full p-4 pl-2 border border-t-0 border-l-0 border-r-0 border-gray-400">
      <div className={`h-12 w-12 rounded-full flex-shrink-0 justify-self-center overflow-hidden`}>
        <img
          src={profile && profile.picture ? profile.picture : `/icon.svg`}
          alt="profile picture"
          className={`w-full h-full object-cover`}
        />
      </div>
      <div className="w-full relative">
        <input
          type="text"
          className="w-full h-12 border border-gray-500 bg-transparent  rounded-3xl p-4 pr-12"
          placeholder="What's on your mind?"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        >
        </input>
        <PaperAirplaneIcon 
        className="w-6 text-blue-400 absolute right-4 top-3 cursor-pointer" 
        onClick={() => publishTweet(content)}
        />
      </div>

    </div >
  )
}

export default PostCreator