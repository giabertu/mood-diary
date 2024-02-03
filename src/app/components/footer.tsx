import { useRouter } from "next/router"


function Footer() {

  const router = useRouter()

  console.log(router.asPath)

  //hide in signin page
  if (router.asPath.includes("/signin")) return null 

  return <div className=" h-[10%]">Ciao Footer</div>
}

export default Footer 