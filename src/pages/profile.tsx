import { useSkContext } from "@/app/context/secretKeyContext"
import { DEFAULT_KEYPAIR, hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"
import { useRouter } from "next/router";
import { useEffect } from "react";

function Profile() {

  const { keyPair, setKeyPair } = useSkContext()
  const router = useRouter()

  // getEvents()
  async function getProfile() {
    const events = await NostrService.getProfileEvents('72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141')
    const actualEvents = await NostrService.getProfileEvents(keyPair.pk)
    const profile = await NostrService.getProfileInfo('72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141')
    const actualProfile = await NostrService.getProfileInfo(keyPair.pk)
    console.log(events)
    console.log(profile)
    console.log({ actualProfile })
    console.log({ actualEvents })
  }
  getProfile()


  useEffect(() => {
    if (localStorage.getItem('keyPair') === null) {
      setKeyPair(DEFAULT_KEYPAIR)
      router.push('/signin')
    }
  }, [])

  return (
    <>
      <h1>Profile</h1>
      {keyPair && <p>KeyPair: {JSON.stringify(keyPair)}</p>}
      <button onClick={() => {
        localStorage.removeItem('keyPair')
        setKeyPair(DEFAULT_KEYPAIR)
        router.push('/signin')

      }}>
        Sign out
      </button>
    </>
  )

}

export default Profile