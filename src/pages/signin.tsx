import React, { useEffect, useState } from 'react'
import { NostrService } from '@/app/services/NostrService'
import "../app/styles/globals.css";
import { hasFailed, supabase } from '@/app/globals';
import { useSkContext } from '@/app/context/secretKeyContext';
import { useRouter } from 'next/router';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import CreateAccount from '@/app/components/createAccount';

function SignIn() {

  const { keyPair, setKeyPair, setProfile } = useSkContext()
  const [sk, setSecret] = useState('')
  const [err, setErr] = useState('')
  const [showCreateAccount, setShowCreateAccount] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const new_keypair = NostrService.getKeyPair(sk.trim())
    console.log(new_keypair)
    if (hasFailed(new_keypair)) {
      setErr(new_keypair.message)
    } else {
      setKeyPair(new_keypair)
      //check if already in supabase
      const { data, error } = await supabase.from('User').select('npub').eq('npub', new_keypair.npub)
      if (data && data.length == 0 && !error) { //new user
        const { error: userCreationError } = await supabase.from('User').insert({ npub: keyPair.npub })
        if (userCreationError) {
          console.error(userCreationError)
          setErr('Supabase user creation error')
          return
        }
      }
      if (error) {
        console.error(error)
        setErr('Supabase error')
        return
      }
      console.log('keyPair before querying profile ', keyPair, new_keypair)
      const prof = await NostrService.getProfileInfo(new_keypair.pk)
      console.log({ prof })
      if (prof.length == 0) {
        console.log('no profile found')
        setErr('No profile associated with this private key. Please create a new account')
        return
      }
      const parsedProfile = JSON.parse(prof[0]?.content)
      setProfile({ ...parsedProfile, created_at: prof[0]?.created_at })
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
    <div className='flex w-screen debug items-center justify-center h-screen'>
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
                className='p-2 border border-gray-300 rounded-md'
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