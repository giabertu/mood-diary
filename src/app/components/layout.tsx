
import Navbar from './navbar'
import Footer from './footer'
import '@/app/styles/globals.css'
import Tabs from './tabs'
import Sidebar from './sidebar'

type LayoutProps = {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className='h-full flex flex-col justify-start items-center'>
      <Navbar />
      <div className='flex w-full h-4/5'>
        <Tabs />
        <main className=' w-1/2 self-center justify-self-center h-full'>{children}</main>
        <Sidebar />
      </div>
      <Footer />
    </div>
  )
}

export default Layout