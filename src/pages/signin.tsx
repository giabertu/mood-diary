import React, { useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";
import { hasFailed } from '@/app/globals';
import { useSkContext } from '@/app/context/secretKeyContext';
import { useRouter } from 'next/router';
import { nip19 } from 'nostr-tools';
import { getUnit8ArrayFromHex } from '@/app/services/utils';

function SignIn() {


  const { keyPair, setKeyPair } = useSkContext()
  const [sk, setSecret] = useState('')
  const [pk, setPublicKey] = useState('')
  const [err, setErr] = useState('')

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_keypair = NostrService.getKeyPair(sk)
    console.log(new_keypair)
    if (hasFailed(new_keypair)){
      setErr(new_keypair.message)
    } else {
      // setPublicKey(new_keypair.pk)
      setKeyPair(new_keypair)
      router.push('/profile')
    }
  }

  const handleChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value
    setSecret(value)

    // NostrService.checkSkFormat("39f00b4ba975042f898136d754d9d7b1fe6395ea1827d7ffbfae6d7a94a23521") 
    // const pk1 = NostrService.getPublicKey("nsec188cqkjafw5zzlzvpxmt4fkwhk8lx8902rqna0lal4ekh499zx5ssaaszf5")
    // const pk2 = NostrService.getPublicKey("39f00b4ba975042f898136d754d9d7b1fe6395ea1827d7ffbfae6d7a94a23521")
    // console.log(pk1)
    // console.log(pk2)
    // console.log(pk1 === pk2)
  }
  
// Priv key
// 39f00b4ba975042f898136d754d9d7b1fe6395ea1827d7ffbfae6d7a94a23521

// Nsec:
// nsec188cqkjafw5zzlzvpxmt4fkwhk8lx8902rqna0lal4ekh499zx5ssaaszf5

  // console.log({
  //   sk,
  //   pk
  // })


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
            // value={sk}s
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