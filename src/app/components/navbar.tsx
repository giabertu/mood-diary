import { useRouter } from "next/router"


function Navbar() {

  const router = useRouter()

  console.log(router.asPath)

  //hide in signin page
  if (router.asPath.includes("/signin")) return null 

  return <div className="debug sticky top-0 z-10 h-20 w-full flex justify-center">Ciao Navbar</div>
}

export default Navbar