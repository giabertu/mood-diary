import React, { useState } from 'react'
import "../app/styles/globals.css";

function SignIn() {

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const handleSubmit = () => {

  }

  const handleChange = () => {

  }

  return (
    <div className='debug flex items-center justify-center h-screen'>
      <div className=' min-h-80 flex flex-col gap-4 bg-white rounded-md p-4 shadow-md'>
        <h1 className='text-3xl font-bold'>Sign in to your account</h1>
        <p>Mood-Diary connects to the Nostr protocol to provide social features.<br/> 
          To sign in to your Nostr account, paste your private key below</p>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <button type="submit">Submit</button>
        </form>
        <p>New to Nostr?</p>
      </div>
    </div>
  )
}



export default SignIn