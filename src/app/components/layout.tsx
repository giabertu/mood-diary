
import Navbar from './navbar'
import Footer from './footer'

type LayoutProps = {
  children: React.ReactNode
}
 
function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default Layout