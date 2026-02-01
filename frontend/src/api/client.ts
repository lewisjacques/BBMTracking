// Use relative path during development (Vite proxy) or full URL in production
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? '/api' 
  : 'http://localhost:8000'

// Helper to get authorization headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

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

/*
Call the API defined as a constant at the top of the file, to return the data from the 
backend to the front end. fetchSessions is called in DayView.tsx to get the sessions 
to display. The function returns a Promise object, this is an object that has not yet been
resolved so requires the use of 'await' when calling it to wait for the data to be returned.
The async keyword actually allows us to return unresolved Promises from the function, rather
than creating a string variable with await response.text() and returning that
*/

/* ----- GET FUNCTIONS ----- */

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
  const response = await fetch(url, {
    headers: getAuthHeaders()
  })
  console.log('Response status:', response.status)
  
  if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.status}`)
  return response.json()
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

export async function createExercise(data: {
  exercise_name: string
  muscle_group_name: string
  exercise_type_name?: string
}): Promise<Exercise> {
  console.log('API call: createExercise', data)
  
  // First ensure muscle group exists
  let muscleGroupId: number
  try {
    const muscleGroupResponse = await fetch(`${API_BASE}/muscle-groups/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muscle_group_name: data.muscle_group_name })
    })
    const muscleGroupData = await muscleGroupResponse.json()
    muscleGroupId = muscleGroupData.id
  } catch (e) {
    // Group might already exist, try to fetch it
    const muscleGroupsResponse = await fetch(`${API_BASE}/muscle-groups/`)
    const muscleGroups = await muscleGroupsResponse.json()
    const existing = muscleGroups.find((g: MuscleGroup) => g.muscle_group_name === data.muscle_group_name)
    if (!existing) throw new Error('Could not create or find muscle group')
    muscleGroupId = existing.id
  }
  
  // Create exercise type if provided
  let exerciseTypeId: number | undefined
  if (data.exercise_type_name) {
    try {
      const typeResponse = await fetch(`${API_BASE}/exercise-types/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type_name: data.exercise_type_name })
      })
      if (typeResponse.ok) {
        const typeData = await typeResponse.json()
        exerciseTypeId = typeData.id
      }
    } catch (e) {
      console.warn('Could not create exercise type, continuing anyway', e)
    }
  }
  
  // Create exercise
  const exercisePayload: any = {
    exercise_name: data.exercise_name,
    exercise_name_legacy: data.exercise_name,
    muscle_group: muscleGroupId
  }
  
  if (exerciseTypeId) {
    exercisePayload.exercise_type = exerciseTypeId
  }
  
  const response = await fetch(`${API_BASE}/exercises/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exercisePayload)
  })
  
  if (!response.ok) throw new Error(`Failed to create exercise: ${response.status}`)
  return response.json()
}

/* ----- POST FUNCTIONS ----- */

// Create a new session
export async function createSession(data: {
  date: string
  notes: string
  completed: boolean
}): Promise<Session> {
  console.log('API call: createSession', data)
  const response = await fetch(`${API_BASE}/sessions/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error(`Failed to create session: ${response.status}`)
  return response.json()
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
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error(`Failed to add session entry: ${response.status}`)
  return response.json()
}

/* ----- DELETE FUNCTIONS ----- */

// Delete session entry
export async function deleteSessionEntry(id: number): Promise<void> {
  console.log('API call: deleteSessionEntry', id)
  const response = await fetch(`${API_BASE}/session-entries/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) throw new Error(`Failed to delete session entry: ${response.status}`)
}

// Delete session
export async function deleteSession(id: number): Promise<void> {
  console.log('API call: deleteSession', id)
  const response = await fetch(`${API_BASE}/sessions/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) throw new Error(`Failed to delete session: ${response.status}`)
}

/* ----- PATCH/UPDATE FUNCTIONS ----- */

// Update session
export async function updateSession(
  id: number,
  data: Partial<Session>
): Promise<Session> {
  const response = await fetch(`${API_BASE}/sessions/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update session')
  return response.json()
}

/* ----- AUTH FUNCTIONS ----- */

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// Register new user
export async function register(data: {
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) {
    throw new Error(JSON.stringify(result))
  }
  return result.user
}

// Login user
export async function login(data: {
  email: string
  password: string
}): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) {
    throw new Error(JSON.stringify(result))
  }
  return result
}

// Get current user
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me/`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  })
  if (!response.ok) throw new Error('Failed to fetch current user')
  return response.json()
}

// Logout user
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  })
  if (!response.ok) throw new Error('Failed to logout')
}

// Refresh token
export async function refreshToken(token: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: token }),
  })
  if (!response.ok) throw new Error('Failed to refresh token')
  return response.json()
}
