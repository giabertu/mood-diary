
import Navbar from './navbar'
import Footer from './footer'
import '@/app/styles/globals.css'

type LayoutProps = {
  children: React.ReactNode
}
 
function Layout({ children }: LayoutProps) {
  return (
    <div className='h-screen'>
      <Navbar />
      <main className=' h-3/5'>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout