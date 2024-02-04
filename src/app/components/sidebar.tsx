import { useRouter } from "next/router"




function Sidebar() {

  const router = useRouter()

  if (router.asPath.includes("/signin")) return null



  return (
    <div className='w-1/5 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        Sidebar Right
      </div>
    </div>
  )
}

export default Sidebar