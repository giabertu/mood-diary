import { useRouter } from "next/router"




function Sidebar() {

  const router = useRouter()

  if (router.asPath.includes("/signin")) return null


  if (router.asPath.includes('/history')) {
    return (
      <div className='w-1/5 border border-gray-300 border-l-0 p-2'>
        <div className="sticky top-20 z-10">
          <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
            <p 
            className="text-lg font-semibold p-2
            backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
            ">Press <span className="border flex-shrink-0 border-gray-700 py-[0.1rem] px-[0.2rem] rounded-md">a</span> when hovering on an entry to toggle play audio</p>
            <p 
            className='text-lg font-semibold p-2
            backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md
            '>Press <span className="border flex-shrink-0 border-gray-700 py-[0.1rem] px-[0.2rem] rounded-md">s</span> to stop the audio from playing </p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className='w-1/5 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        Sidebar Right
      </div>
    </div>
  )
}

export default Sidebar