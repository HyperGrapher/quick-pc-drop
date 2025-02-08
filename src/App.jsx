import { useState } from 'react'
import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.jsx'
import './App.css'
import FileUpload from './FileUpload.js'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='bg-gray-900 px-4 flex flex-col gap-8 pt-16 items-center min-h-screen'>
      <header className='flex flex-col items-center gap-4'>
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className="logo h-36" alt="Quick PC Drop logo" />
        </a>
        <h1 className='text-grayx-300 font-bold text-4xl 
        bg-gradient-to-r from-blue-600 via-green-500 to-amber-400 
        inline-block text-transparent bg-clip-text'>Quick PC Drop</h1>
      </header>


      <section className="flex flex-col gap-4">
        <div className="block max-w-sm p-6 border rounded-lg shadow-sm bg-gray-800 border-gray-700">

          <FileUpload />
        </div>

        <button
          className='btn w-36 cursor-pointer text-gray-800 font-bold px-3 py-1 rounded shadow-2xl'
          onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>


      </section>

      <PWABadge />
    </main>
  )
}

export default App
