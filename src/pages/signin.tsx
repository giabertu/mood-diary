import React, { useEffect, useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";
import { hasFailed } from '@/app/globals';
import { useSkContext } from '@/app/context/secretKeyContext';
import { useRouter } from 'next/router';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import CreateAccount from '@/app/components/createAccount';

function SignIn() {

  const { keyPair, setKeyPair } = useSkContext()
  const [sk, setSecret] = useState('')
  const [err, setErr] = useState('')
  const [showCreateAccount, setShowCreateAccount] = useState(false)

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_keypair = NostrService.getKeyPair(sk.trim())
    console.log(new_keypair)
    if (hasFailed(new_keypair)) {
      setErr(new_keypair.message)
    } else {
      setKeyPair(new_keypair)
      localStorage.setItem('keyPair', JSON.stringify(new_keypair))
      router.push('/profile')
    }
  }

  const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value
    setSecret(value)
  }


  useEffect(() => {
    const storedKeys = localStorage.getItem('keyPair')
    if (storedKeys !== null) {
      router.push('/profile')
      setKeyPair(JSON.parse(storedKeys))
    }
  }, [])

  return (
    <div className='debug flex items-center justify-center h-screen'>
      <div className=' min-h-80 flex flex-col gap-4 bg-white rounded-md p-8 shadow-md max-w-[45rem]'>
        {showCreateAccount ?
          <CreateAccount /> :
          <>
            <h1 className='text-3xl font-bold'>Sign in to your account</h1>
            <p className=''>Mood-Diary connects to the Nostr protocol to provide social features.
              To sign in to your Nostr account, paste your private key below</p>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <textarea
                name="secret key"
                required={true}
                value={sk}
                className=''
                rows={3}
                onChange={handleChange}
              />
              {err && <p className='text-red-500'>{err}</p>}
              <button type="submit">Sign In</button>
            </form>
          </>
        }
        <button onClick={() => setShowCreateAccount(prev => !prev)}>{showCreateAccount ? "I already have a private key" : "New to Nostr?"} </button>
      </div>
    </div>
  )
}



export default SignIn