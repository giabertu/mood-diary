import { useRouter } from "next/router"



function Tabs() {


  const router = useRouter()

  if (router.asPath.includes("/signin")) return null


  return (
    <div className='w-1/4'>
      Tabs
    </div>
  )
}


export default Tabs