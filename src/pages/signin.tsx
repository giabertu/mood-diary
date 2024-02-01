import React, { useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";
import { hasFailed } from '@/app/globals';
import { useSkContext } from '@/app/context/secretKeyContext';
import { useRouter } from 'next/router';

function SignIn() {


  const { sk, setSecret } = useSkContext()
  const [pk, setPublicKey] = useState('')
  const [err, setErr] = useState('')

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_pk = NostrService.getPublicKey(sk)
    console.log(new_pk)
    if (hasFailed(new_pk)){
      setErr(new_pk.message)
    } else {
      setPublicKey(new_pk)
      router.push('/profile')
    }
  }

  const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value
    setSecret(value)
  }

  console.log({
    sk,
    pk
  })

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