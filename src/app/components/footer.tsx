import { useRouter } from "next/router"


function Footer() {

  const router = useRouter()

  //hide in signin page
  if (router.asPath.includes("/signin")) return null 

  return <div className=" h-[10%]"></div>
}

export default Footer 