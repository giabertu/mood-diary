import { ReactElement, ReactNode } from 'react'
import Layout from '../app/components/layout'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { SecretKeyProvider } from '@/app/context/secretKeyContext'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <SecretKeyProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SecretKeyProvider>
  )
}