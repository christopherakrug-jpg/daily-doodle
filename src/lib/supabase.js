import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const todayDate = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date())

export function getUserId() {
  let id = localStorage.getItem('doodle_user_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('doodle_user_id', id)
  }
  return id
}

function calcStreak(sortedDates) {
  if (!sortedDates.length) return 0
  const today = todayDate()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (new Date(sortedDates[i - 1]) - new Date(sortedDates[i])) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

export async function getTodayPrompt() {
  if (!supabase) return null
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('date', todayDate())
    .single()
  return data ?? null
}

export async function uploadDoodle(blob, promptId) {
  if (!supabase) throw new Error('Supabase not configured')
  const filename = `${promptId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
  const { error } = await supabase.storage
    .from('doodles')
    .upload(filename, blob, { contentType: 'image/png' })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('doodles').getPublicUrl(filename)
  return publicUrl
}

export async function saveDoodle({ imageUrl, promptId, nickname, userId }) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('doodles')
    .insert({ image_url: imageUrl, prompt_id: promptId, nickname: nickname?.trim() || null, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserActivity(userId) {
  if (!supabase || !userId) return { streak: 0, recentDays: [] }
  const { data, error } = await supabase
    .from('doodles')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return { streak: 0, recentDays: [] }

  const submittedDates = new Set(data.map((d) => d.created_at.slice(0, 10)))
  const sortedDates = [...submittedDates].sort().reverse()
  const streak = calcStreak(sortedDates)

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const dateStr = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
    return { date: dateStr, submitted: submittedDates.has(dateStr) }
  })

  return { streak, recentDays }
}

export async function hasSubmittedToday(userId, promptId) {
  if (!supabase || !userId || !promptId) return false
  const { data } = await supabase
    .from('doodles')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .limit(1)
    .maybeSingle()
  return !!data
}

export async function getTodayDoodles(promptId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
