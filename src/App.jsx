import { useState } from 'react'
import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.jsx'
import './App.css'

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

          <div className="max-w-lg mx-auto">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="user_avatar">Upload file</label>
            <input className="block pl-2 py-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
            dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              aria-describedby="file-selector" type="file" />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="user_avatar_help">
              Select a file and make sure upload server is running on the same network
            </div>

            <button
              className='btn mt-4 w-full bg-amber-300 hover:bg-amber-400 cursor-pointer font-bold px-3 py-1 rounded shadow-2xl'
              onClick={() => setCount((count) => count + 1)}>
              Upload
            </button>
          </div>
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
