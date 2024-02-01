import React, { useEffect, useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";
import { hasFailed } from '@/app/globals';
import { useSkContext } from '@/app/context/secretKeyContext';
import { useRouter } from 'next/router';

function SignIn() {

  const { keyPair, setKeyPair } = useSkContext()
  const [sk, setSecret] = useState('')
  const [err, setErr] = useState('')

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_keypair = NostrService.getKeyPair(sk)
    console.log(new_keypair)
    if (hasFailed(new_keypair)){
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
    if (localStorage.getItem('keyPair') !== null){
      router.push('/profile')
    }
  }, [])

  return (
    <div className='debug flex items-center justify-center h-screen'>
      <div className=' min-h-80 flex flex-col gap-4 bg-white rounded-md p-8 shadow-md'>
        <h1 className='text-3xl font-bold'>Sign in to your account</h1>
        <p>Mood-Diary connects to the Nostr protocol to provide social features.<br />
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
        <p>New to Nostr?</p>
      </div>
    </div>
  )
}



export default SignIn