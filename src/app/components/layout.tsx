'use client'

import Navbar from './navbar'
import Footer from './footer'
import '@/app/styles/globals.css'
import Tabs from './tabs'
import Sidebar from './sidebar'
import { useEffect } from 'react'
import { DEFAULT_KEYPAIR } from '../globals'
import { useRouter } from 'next/router'
import { useSkContext } from '../context/secretKeyContext'

type LayoutProps = {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {


  const router = useRouter()
  const { keyPair, setKeyPair } = useSkContext()

  useEffect(() => {
    if (localStorage.getItem('keyPair') === null) {
      setKeyPair(DEFAULT_KEYPAIR)
      router.push('/signin')
    }
  }, [])


  if (router.asPath.includes('/signin')) {
    return (
      <div style={{
        backgroundImage: "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
        className='h-full flex flex-col justify-start items-center text-gray-700'>
        {children}
      </div>)
  }

  return (
    <div style={{
      backgroundImage: "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)",
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
    }}
      className='h-full flex flex-col justify-start items-center'>
      <Navbar />
      <div className='flex w-full h-4/5'>
        <Tabs />
        <main className=' w-1/2  min-h-[90vh] text-gray-700
        backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'>{children}</main>
        <Sidebar />
      </div>
      <Footer />
    </div>
  )
}

export default Layout