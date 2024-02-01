import { useRouter } from "next/router"


function Navbar() {

  const router = useRouter()

  console.log(router.asPath)

  //hide in signin page
  if (router.asPath.includes("/signin")) return null 

  return <div>Ciao Navbar</div>
}

export default Navbar