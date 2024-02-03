import { useRouter } from "next/router"



function Tabs() {


  const router = useRouter()

  if (router.asPath.includes("/signin")) return null


  return (
    <div className='w-1/4 border border-gray-300 h-full p-2 border-r-0'>
      Tabs
    </div>
  )
}


export default Tabs