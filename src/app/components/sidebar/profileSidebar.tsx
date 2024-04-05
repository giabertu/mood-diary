import { useSkContext } from "@/app/context/secretKeyContext";



function ProfileSidebar() {

  const { keyPair, following, profile, followers } = useSkContext()


  return (
    <div className='w-1/4 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
        <p
            className='text-lg font-semibold p-2 flex gap-2 items-center justify-center
        backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
        '>Follwers count: <span className={`flex-shrink-0 ${following && "border border-gray-700" } py-[0.1rem] px-[0.2rem] rounded-md`}>
          {followers ? followers.length : <img src="/loading.svg" className="w-8 inline flex-shrink-0"/>}</span></p>
          <p
            className='text-lg font-semibold p-2 flex gap-2 items-center justify-center
        backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
        '>Following count: <span className={`flex-shrink-0 ${following && "border border-gray-700" } py-[0.1rem] px-[0.2rem] rounded-md`}>
          {following ? following.length : <img src="/loading.svg" className="w-8 inline flex-shrink-0"/>}</span></p>
        </div>
      </div>
    </div>
  )



}


export default ProfileSidebar;