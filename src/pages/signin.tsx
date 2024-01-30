import React, { useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";

function SignIn() {

  const [sk, setSecret] = useState('')
  const [pk, setPublicKey] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_pk = NostrService.getPublicKey(sk)
    setPublicKey(new_pk)
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setSecret(value)
  }

  console.log({
    sk,
    pk
  })
  
  return (
    <div className='debug flex items-center justify-center h-screen'>
      <div className=' min-h-80 flex flex-col gap-4 bg-white rounded-md p-4 shadow-md'>
        <h1 className='text-3xl font-bold'>Sign in to your account</h1>
        <p>Mood-Diary connects to the Nostr protocol to provide social features.<br />
          To sign in to your Nostr account, paste your private key below</p>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type="text"
            name="secret key"
            value={sk}
            onChange={handleChange}
          />
          <button type="submit">Sign In</button>
        </form>
        <p>New to Nostr?</p>
      </div>
    </div>
  )
}



export default SignIn