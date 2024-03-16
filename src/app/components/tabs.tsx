import { useRouter } from "next/router"
import { useSkContext } from "../context/secretKeyContext"
import { DEFAULT_KEYPAIR } from "../globals"
import { useState } from "react"
import { HomeIcon } from "@heroicons/react/24/outline"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { MicrophoneIcon } from "@heroicons/react/24/outline"
import { ChartBarIcon } from "@heroicons/react/24/outline"
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline"


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
      <div className="sticky top-20 flex flex-col gap-8 items-start pl-20">
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
          onClick={() => router.push('/home')}
        >
          <HomeIcon className="w-6" /> Home
        </button>
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
          onClick={() => router.push('/history')}
        >
          <ChartBarIcon className="w-6" /> History
        </button>
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
         onClick={() => router.push('/record/')}
         >
          <MicrophoneIcon className="w-6" /> Record
        </button>
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
          onClick={() => router.push('/profile')}
        >
          <UserCircleIcon className="w-6" /> Profile
        </button>
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4">
          <Cog6ToothIcon className="w-6" /> Settings
        </button>
        <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
          onClick={() => {
            localStorage.removeItem('keyPair')
            setKeyPair(DEFAULT_KEYPAIR)
            router.push('/signin')

          }}>
          <ArrowLeftStartOnRectangleIcon className="w-6" />
          Sign out
        </button>
      </div>
    </div>
  )
}


export default Tabs