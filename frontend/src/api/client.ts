// Use relative path during development (Vite proxy) or full URL in production
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? '/api' 
  : 'http://localhost:8000'

export interface Exercise {
  id: number
  exercise_name: string
  muscle_group: {
    id: number
    muscle_group_name: string
  }
  exercise_type: {
    id: number
    type_name: string
  }
}

export interface SessionEntry {
  id: number
  exercise: Exercise
  weight: string
  status: string
}

export interface Session {
  id: number
  date: string
  notes: string
  completed: boolean
  session_entries: SessionEntry[]
}

export interface MuscleGroup {
  id: number
  muscle_group_name: string
}

// Fetch sessions with optional filters
export async function fetchSessions(params?: {
  dateFrom?: string
  dateTo?: string
  muscleGroupId?: number
  exerciseId?: number
  completed?: boolean
}): Promise<Session[]> {
  const searchParams = new URLSearchParams()
  
  if (params?.dateFrom) searchParams.append('date_from', params.dateFrom)
  if (params?.dateTo) searchParams.append('date_to', params.dateTo)
  if (params?.muscleGroupId) searchParams.append('muscle_group_id', params.muscleGroupId.toString())
  if (params?.exerciseId) searchParams.append('exercise_id', params.exerciseId.toString())
  if (params?.completed !== undefined) searchParams.append('completed', params.completed.toString())

  const query = searchParams.toString()
  const url = `${API_BASE}/sessions/${query ? '?' + query : ''}`
  
  console.log('Fetching sessions from:', url)
  const response = await fetch(url)
  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const text = await response.text()
    console.error('Failed to fetch sessions:', response.status, text)
    throw new Error(`Failed to fetch sessions: ${response.status}`)
  }
  
  const data = await response.json()
  console.log('Sessions data:', data)
  return data
}

// Fetch exercises with optional filters
export async function fetchExercises(params?: {
  muscleGroupId?: number
  exerciseTypeId?: number
}): Promise<Exercise[]> {
  const searchParams = new URLSearchParams()
  
  if (params?.muscleGroupId) searchParams.append('muscle_group', params.muscleGroupId.toString())
  if (params?.exerciseTypeId) searchParams.append('exercise_type', params.exerciseTypeId.toString())

  const query = searchParams.toString()
  const url = `${API_BASE}/exercises/${query ? '?' + query : ''}`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch exercises')
  return response.json()
}

// Fetch all muscle groups
export async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const response = await fetch(`${API_BASE}/muscle-groups/`)
  if (!response.ok) throw new Error('Failed to fetch muscle groups')
  return response.json()
}

// Create a new session
export async function createSession(data: {
  date: string
  notes: string
  completed: boolean
}): Promise<Session> {
  console.log('API call: createSession', data)
  const response = await fetch(`${API_BASE}/sessions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  const responseText = await response.text()
  console.log('Create session response status:', response.status)
  console.log('Create session response body:', responseText)
  
  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status} - ${responseText}`)
  }
  
  return JSON.parse(responseText)
}

// Add exercise to session
export async function addSessionEntry(data: {
  session: number
  exercise: number
  weight: string
  status: string
}): Promise<SessionEntry> {
  console.log('API call: addSessionEntry', data)
  const response = await fetch(`${API_BASE}/session-entries/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  const responseText = await response.text()
  console.log('Response status:', response.status)
  console.log('Response body:', responseText)
  
  if (!response.ok) {
    throw new Error(`Failed to add session entry: ${response.status} - ${responseText}`)
  }
  
  return JSON.parse(responseText)
}

// Delete session entry
export async function deleteSessionEntry(id: number): Promise<void> {
  console.log('API call: deleteSessionEntry', id)
  const response = await fetch(`${API_BASE}/session-entries/${id}/`, {
    method: 'DELETE',
  })
  
  const responseText = await response.text()
  console.log('Delete session entry response status:', response.status)
  console.log('Delete session entry response body:', responseText)
  
  if (!response.ok) {
    throw new Error(`Failed to delete session entry: ${response.status} - ${responseText}`)
  }
}

// Delete session
export async function deleteSession(id: number): Promise<void> {
  console.log('API call: deleteSession', id)
  const response = await fetch(`${API_BASE}/sessions/${id}/`, {
    method: 'DELETE',
  })
  
  const responseText = await response.text()
  console.log('Delete session response status:', response.status)
  console.log('Delete session response body:', responseText)
  
  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.status} - ${responseText}`)
  }
}

// Update session
export async function updateSession(
  id: number,
  data: Partial<Session>
): Promise<Session> {
  const response = await fetch(`${API_BASE}/sessions/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update session')
  return response.json()
}
