import { useSkContext } from "@/app/context/secretKeyContext";
import { DEFAULT_RELAYS } from "@/app/globals";
import { DocumentDuplicateIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"





function Settings() {

  const { keyPair, profile } = useSkContext()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };


  return (
    <div className="h-full w-full">
      <div className='flex flex-col gap-8 p-8'>
        <div className="relative flex justify-between w-full items-center">
          <h1 className='text-2xl font-bold'>Settings</h1>
          <div className="w-14 h-14 rounded-full justify-self-center absolute right-0 overflow-hidden flex items-center justify-center">
              <img
                src={profile.picture ? profile.picture : `/icon.svg`}
                alt="profile picture"
                className="absolute w-full h-full object-cover"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
        </div>
        <div className="flex flex-col gap-2">
          <p
            style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }}
            className='text-lg font-bold bg-clip-text text-transparent'>
            Your private key</p>
          <div className='flex gap-2 bg-slate-200 bg-opacity-40 rounded-md p-2 items-center justify-between'>
            <p className='text-green-500'>{keyPair.nsec}</p>
            <DocumentDuplicateIcon
              onClick={() => copyToClipboard(keyPair.nsec)}
              className='h-4 w-4 justify-end cursor-pointer' />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p
            style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }}
            className='text-lg font-bold bg-clip-text text-transparent'>
            Your public key</p>
          <div className='flex gap-2 bg-slate-200 bg-opacity-40 rounded-md p-2 items-center justify-between'>
            <p className='text-green-500'>{keyPair.npub}</p>
            <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.npub)}
              className='h-4 w-4 justify-end cursor-pointer' />
          </div>
        </div>
        <p className=" bg-slate-200 p-2 flex bg-opacity-40 gap-4 rounded-md"><ExclamationTriangleIcon className="w-6" />
          Keep your keys safe. You will need the private key to login into your account.
        </p>
        <div className="flex flex-col gap-4">
          <p
            style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }}
            className='text-lg font-bold bg-clip-text text-transparent'>
            List of Relays</p>
          <div className="flex gap-4 flex-col ">
            {DEFAULT_RELAYS.map((relay, index) => (
              <div className='flex gap-2 bg-slate-200 bg-opacity-40 rounded-md p-2 items-center justify-between'>
                <p className='text-semibold'>{relay}</p>
                <DocumentDuplicateIcon onClick={() => copyToClipboard(keyPair.nsec)}
                  className='h-4 w-4 justify-end cursor-pointer' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings