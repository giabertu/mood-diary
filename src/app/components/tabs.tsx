import { useRouter } from "next/router"
import { useSkContext } from "../context/secretKeyContext"
import { DEFAULT_KEYPAIR } from "../globals"



function Tabs() {


  const router = useRouter()
  const { keyPair, setKeyPair } = useSkContext()

  if (router.asPath.includes("/signin")) return null


  return (
    <div className='w-1/4 debug border border-gray-300 p-2 border-r-0'>
      <div className="sticky top-20 flex flex-col gap-4">
        <button>
          Tabs
        </button>
        <button onClick={() => {
          localStorage.removeItem('keyPair')
          setKeyPair(DEFAULT_KEYPAIR)
          router.push('/signin')

        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}


export default Tabs