import { useRouter } from "next/router"
import { useSkContext } from "../context/secretKeyContext"
import { DEFAULT_KEYPAIR } from "../globals"
import { useState } from "react"


enum Tab {
  Home = 'home',
  Profile = 'profile',
  Settings = 'settings'
}



function Tabs() {


  const router = useRouter()
  const { keyPair, setKeyPair } = useSkContext()

  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Profile)

  if (router.asPath.includes("/signin")) return null


  return (
    <div className='w-1/4 debug border border-gray-300 p-2 border-r-0'>
      <div className="sticky top-20 flex flex-col gap-8 items-center">
        <button className="border border-gray-300 rounded-3xl p-4"
        onClick={() => router.push('/home')}
        >
          Home
        </button>
        <button className="border border-gray-300 rounded-3xl p-4">
          History
        </button>
        <button className="border border-gray-300 rounded-3xl p-4">
          Record
        </button>
        <button className="border border-gray-300 rounded-3xl p-4"
        onClick={() => router.push('/profile')}
        >
          Profile
        </button>
        <button className="border border-gray-300 rounded-3xl p-4">
          Settings
        </button>
        <button className="border border-gray-300 rounded-3xl p-4"
          onClick={() => {
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