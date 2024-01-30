import { NostrService } from '@/app/services/NostrService'
import React, { useState } from 'react'
import { Relay, finalizeEvent, generateSecretKey, getPublicKey, SimplePool } from 'nostr-tools'
import { DEFAULT_RELAYS } from '@/app/globals'
import "../app/styles/globals.css";

/**
 * 
 *  
 * Private key: 6112325313877113971611491532232121911418424214456943671381371273115324132546730138
 * Public key: 69ebba4c3bf2d6cbc214ad0644ce60275c4251861549b2b06679988401dec6f8
 */

function Test() {


  const [privKey, setPrivKey] = useState<Uint8Array>(new Uint8Array(0))
  const [pubKey, setPubKey] = useState<string>('a0bc47d7947bf9c09de3eb507405e9fdbc0ada76907d67bfe49e0538189d7b79')

  return (
    <div className=''>
      <p className='debug'>Ciao this is a test page</p>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>

      <button className='btn text-lg bg-red-500 text-opacity-20 btn-primary block'
        onClick={async () => {
          const keyPair = NostrService.generateKeyPair()
          setPrivKey(keyPair.sk)
          setPubKey(keyPair.pk)
        }}
      >Click to generate private key / pub key pair</button>

      {privKey.length > 0 && <div>Private key: {privKey}</div>}
      {pubKey ? <div>Public key: {pubKey}</div> : null}
    </div>
  )


}


export default Test