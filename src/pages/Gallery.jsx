import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getTodayPrompt, getTodayDoodles, getUserId, getUserActivity } from '../lib/supabase'

const FORMATTED_DATE = new Date().toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export default function Gallery() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const [prompt, setPrompt] = useState(null)
  const [doodles, setDoodles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activity, setActivity] = useState({ streak: 0, recentDays: [] })

  useEffect(() => {
    async function load() {
      try {
        let promptId = state?.promptId
        let promptText = null

        if (!promptId) {
          const p = await getTodayPrompt()
          if (p) {
            promptId = p.id
            promptText = p.prompt_text
            setPrompt(p)
          }
        }

        if (promptId) {
          if (!promptText) {
            const p = await getTodayPrompt()
            setPrompt(p)
          }
          const [data, userActivity] = await Promise.all([
            getTodayDoodles(promptId),
            getUserActivity(getUserId()),
          ])
          setDoodles(data)
          setActivity(userActivity)
        }
      } catch (err) {
        setError('Could not load doodles. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [state?.promptId])

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      <header className="w-full max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {FORMATTED_DATE}
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          Today's Gallery
        </h1>
      </header>

      {loading && (
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && doodles.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <p className="text-gray-400 font-semibold">No doodles yet today.</p>
          <p className="text-gray-400 text-sm">Be the first to submit one!</p>
        </div>
      )}

      {!loading && !error && doodles.length > 0 && (
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3">
          {doodles.map((doodle) => (
            <div
              key={doodle.id}
              className="flex flex-col gap-1.5"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-[#EDE8E1] bg-white shadow-sm">
                <img
                  src={doodle.image_url}
                  alt={doodle.nickname ? `Doodle by ${doodle.nickname}` : 'Anonymous doodle'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {doodle.nickname && (
                <p className="text-xs text-center text-gray-400 font-semibold truncate px-1">
                  {doodle.nickname}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="mt-4 border border-[#E0D9D0] text-gray-600 font-semibold px-6 py-2.5 rounded-2xl hover:border-gray-400 transition-colors text-sm"
      >
        Back to canvas
      </button>
    </div>
  )
}
