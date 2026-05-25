import { useNavigate, useLocation } from 'react-router-dom'

export default function Confirmation() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const promptId = state?.promptId

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4845A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Your doodle is in!
        </h1>
        <p className="text-gray-500 text-base">
          Thanks for doodling today. See what everyone else drew.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/gallery', { state: { promptId } })}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-2xl hover:opacity-90 active:opacity-80 transition-opacity shadow-sm"
        >
          View today's gallery
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full border border-[#E0D9D0] text-gray-600 font-semibold py-3 rounded-2xl hover:border-gray-400 transition-colors"
        >
          Back to canvas
        </button>
      </div>
    </div>
  )
}
