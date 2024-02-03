import { useRouter } from "next/router"




function Sidebar() {

  const router = useRouter()

  if (router.asPath.includes("/signin")) return null



  return <div className='w-1/5 border border-gray-300 border-l-0 h-full p-2'>
    Sidebar Right
  </div>

}

export default Sidebar