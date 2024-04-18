
import { useSkContext } from "@/app/context/secretKeyContext";
import DiaryService from "@/app/services/DiaryService";
import { NostrService } from "@/app/services/NostrService";
import { UserProfile } from "@/pages/profile";
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";

type UserProfileWithPk = UserProfile & { pk: string }

function HomeSidebar() {

  const { following } = useSkContext()
  const [moodDiaryProfiles, setMoodDiaryProfiles] = useState<UserProfileWithPk[]>([])

  const router = useRouter()

  useEffect(() => {
    const getUsers = async () => {
      const users = await DiaryService.getMoodDiaryUsers()
      const profiles = await NostrService.getProfileInfo(users)
      const parsedProfiles: UserProfileWithPk[] = profiles.map((profile: any) => { 
        return {...JSON.parse(profile.content), pk: profile.pubkey} 
      })
      console.log("Profile Events in HomeSidebar: ", { parsedProfiles })
      setMoodDiaryProfiles(parsedProfiles)
    }
    getUsers()
  }, [])




  return (
    <div className='w-1/4 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
          <p className='text-lg font-semibold p-2 flex gap-2 items-center justify-center backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'>Discover Mood-Diary users</p>
          {moodDiaryProfiles.filter(profile => profile.picture).map((profile, i) => {
            return <div className="flex gap-2 w-full h-16 items-center
            ">

              <div className={`rounded-full flex-shrink-0 justify-self-center overflow-hidden w-12 h-12`}>
                <img
                  src={profile.picture ? profile.picture : `/icon.svg`}
                  alt="profile picture"
                  className={`w-full h-full object-cover`}
                />
              </div>

              <div className="flex flex-col w-full">
                <div className="flex gap-2 text-sm w-full justify-between">
                  <div className="flex gap-2 hover:underline cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    profile && router.push(`/user/${nip19.npubEncode(profile.pk)}`);
                  }}>
                    <p className="font-bold">{profile && profile.display_name}</p>
                    <p className="text-gray-500">{profile && profile.name}</p>
                  </div>
                </div>
              </div>
            </div>
          })
          }

          <p className='text-lg font-semibold p-2 flex gap-2 items-center justify-center backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'></p>
        </div>
      </div>
    </div>
  )



}


export default HomeSidebar;