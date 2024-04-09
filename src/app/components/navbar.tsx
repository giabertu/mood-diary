import { useRouter } from "next/router"


function Navbar() {

  const router = useRouter()

  console.log(router.asPath)

  //hide in signin page
  if (router.asPath.includes("/signin")) return null

  return <div className='flex flex-col gap-8 h-full w-full py-1'>
    <div className='flex gap-20 flex-col text-gray-700 p-4 items-center h-full w-full'>
      <div className="flex items-center justify-center gap-4">
        <img src="/diary-1027.svg" className="w-10 " alt="" />
        <h2 className='text-3xl font-bold text-center'>Mood-Diary</h2>
      </div>
    </div>
  </div>
}

export default Navbar