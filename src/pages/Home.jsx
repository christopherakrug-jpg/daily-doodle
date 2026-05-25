import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DrawingCanvas from '../components/DrawingCanvas'
import Toolbar from '../components/Toolbar'
import { getTodayPrompt, uploadDoodle, saveDoodle, getUserId, hasSubmittedToday, isConfigured } from '../lib/supabase'

const FALLBACK_PROMPT = {
  id: null,
  path_data: 'M 15 20 C 15 50 85 50 85 80',
  prompt_text: 'an s-curve? where does it bend next?',
}

const FORMATTED_DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default function Home() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [prompt, setPrompt] = useState(null)
  const [promptLoading, setPromptLoading] = useState(true)
  const [brushSize, setBrushSize] = useState(10)
  const [isErasing, setIsErasing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConfigured) {
      setPrompt(FALLBACK_PROMPT)
      setPromptLoading(false)
      return
    }
    getTodayPrompt()
      .then(async (data) => {
        const p = data ?? FALLBACK_PROMPT
        setPrompt(p)
        if (p.id) {
          const submitted = await hasSubmittedToday(getUserId(), p.id)
          setAlreadySubmitted(submitted)
        }
      })
      .catch(() => setPrompt(FALLBACK_PROMPT))
      .finally(() => setPromptLoading(false))
  }, [])

  async function handleSubmit() {
    if (!isConfigured) {
      setError('Supabase is not connected. Add credentials to submit.')
      return
    }
    if (!prompt?.id) {
      setError('No prompt found for today. Check your database.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const dataURL = canvasRef.current.exportPNG()
      const blob = await (await fetch(dataURL)).blob()
      const imageUrl = await uploadDoodle(blob, prompt.id)
      await saveDoodle({ imageUrl, promptId: prompt.id, nickname, userId: getUserId() })
      navigate('/done', { state: { promptId: prompt.id } })
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-5">
      <header className="w-full max-w-[600px] text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {FORMATTED_DATE}
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Today's Doodle
        </h1>
      </header>

      <DrawingCanvas
        ref={canvasRef}
        brushSize={brushSize}
        isErasing={isErasing}
        promptPath={promptLoading ? null : prompt?.path_data}
      />

      <Toolbar
        brushSize={brushSize}
        isErasing={isErasing}
        onSizeChange={setBrushSize}
        onEraserToggle={() => setIsErasing((v) => !v)}
        onClear={() => canvasRef.current?.clear()}
      />

      <div className="w-full max-w-[600px] flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600" htmlFor="nickname">
          Your nickname{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="nickname"
          type="text"
          maxLength={20}
          placeholder="e.g. doodlemaster"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full border border-[#E0D9D0] rounded-xl px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {error && (
        <div className="w-full max-w-[600px] bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {alreadySubmitted ? (
        <div className="w-full max-w-[600px] bg-gray-50 border border-[#E0D9D0] rounded-2xl py-4 text-center">
          <p className="font-bold text-gray-500">You've already doodled today!</p>
          <p className="text-sm text-gray-400 mt-0.5">Come back tomorrow for a new prompt.</p>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={submitting || promptLoading}
          className="w-full max-w-[600px] bg-accent text-white font-bold text-lg py-4 rounded-2xl hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? 'Submitting…' : 'Submit Doodle'}
        </button>
      )}

      <nav className="w-full max-w-[600px] pb-4">
        <button
          onClick={() => navigate('/gallery', { state: { promptId: prompt?.id } })}
          className="w-full border border-[#E0D9D0] text-gray-600 font-semibold py-3 rounded-2xl hover:border-gray-400 hover:text-gray-800 transition-colors text-sm"
        >
          View today's gallery
        </button>
      </nav>
    </div>
  )
}
