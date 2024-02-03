import { useState } from "react";
import { useSkContext } from "../context/secretKeyContext";
import { NostrService } from "../services/NostrService";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { finalizeEvent, verifyEvent } from "nostr-tools";

function CreateAccount() {

  const { keyPair, setKeyPair } = useSkContext()
  const [err, setErr] = useState('')
  const [name, setName] = useState('')
  const [about, setabout] = useState('')
  const [display_name, setDisplayName] = useState('')

  const router = useRouter()

  const handleGenerate = () => {
    const keyPair = NostrService.generateKeyPair()
    setKeyPair(keyPair)
  }


  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let event = finalizeEvent({
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({ name, about, display_name })
    }, keyPair.sk)

    let isGood = verifyEvent(event)
    console.log({ isGood, event })

    const res = await NostrService.publishEvent(event)
    console.log({ res })
    if (res) {
      localStorage.setItem('keyPair', JSON.stringify(keyPair))
      router.push('/profile')
    } else {
      setErr('Something went wrong')
    }

  }

  return (
    <>
      <h1 className='text-3xl font-bold'>Create a new account</h1>
      <p className=''>All you need to be able to login into your Nostr (and therefore Mood-diary) account is a private key. Other people will be able to find you using your public key.</p>
      {(!keyPair.nsec || keyPair.nsec == 'nsec1') && <button onClick={handleGenerate}>Generate private key</button>}
      {keyPair.nsec && keyPair.nsec !== 'nsec1' &&
        <div className='flex flex-col gap-2'>
          <div>
            <p>Your private key</p>
            <div className='flex gap-2 bg-slate-100 rounded-md p-2 items-center justify-between'>
              <p className='text-green-500'>{keyPair.nsec}</p>
              <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.nsec)}
                className='h-4 w-4 justify-end' />
            </div>
          </div>
          <div>
            <p>Your public key</p>
            <div className='flex gap-2 bg-slate-100 rounded-md p-2 items-center justify-between'>
              <p className='text-green-500'>{keyPair.npub}</p>
              <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.npub)}
                className='h-4 w-4 justify-end' />
            </div>
          </div>
          <p>Save these keys somewhere safe. You will need the private key to login into your account.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-8 w-full">
              <input
                type="text"
                value={display_name}
                required={true}
                className="grow p-2 border border-gray-300 rounded-md"
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Your display name' />
              <input
                type="text"
                value={name}
                required={true}
                className=" grow p-2 border border-gray-300 rounded-md"
                onChange={(e) => setName(e.target.value)}
                placeholder='Your username' />
            </div>
            <textarea
              value={about}
              className="w-full border border-gray-300 rounded-md p-2"
              onChange={(e) => setabout(e.target.value)}
              placeholder='Your about' />

            <button type="submit">Log me in</button>
          </form>
        </div>
      }
      {err && <p className='text-red-500'>{err}</p>}
    </>
  )


}



export default CreateAccount;