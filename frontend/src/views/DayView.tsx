import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fetchSessions, Session, fetchExercises, Exercise, fetchMuscleGroups, MuscleGroup, createSession, addSessionEntry, deleteSessionEntry, deleteSession } from '../api/client'
import { SummaryCards } from '../components/SummaryCards'
import { ExercisesTable } from '../components/ExercisesTable'
import { AddExerciseModal } from '../components/AddExerciseModal'
import { Plus } from 'lucide-react'

interface DayViewProps {
  date: Date
}

interface FormData {
  muscleGroup: string
  exercise: string
  weight: string
  status: 'Peak' | 'Static' | 'Other'
}

export function DayView({ date }: DayViewProps) {
  /* 
  useState is a React hook that allows you to add 'state' to a functional component
  const [current_value, function_to_update_it] = useState(initial_value)
  */
  const [sessions, setSessions] = useState<Session[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    muscleGroup: '',
    exercise: '',
    weight: '',
    status: 'Peak'
  })
  const [submitting, setSubmitting] = useState(false)

  // If formData.muscleGroup exists filter exercises by that muscle group
  const filteredExercises = formData.muscleGroup
    ? exercises.filter(ex => ex.muscle_group.id === parseInt(formData.muscleGroup))
    : exercises

  // Upon the loading of a new date, fetch sessions, exercises, MGs for that date
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const dateStr = format(date, 'yyyy-MM-dd')
        console.log('Loading sessions for date:', dateStr)
        const sessionsData = await fetchSessions({
          dateFrom: dateStr,
          dateTo: dateStr,
        })
        const exercisesData = await fetchExercises()
        const muscleGroupsData = await fetchMuscleGroups()
        
        console.log('Loaded sessions:', sessionsData)
        setSessions(sessionsData)
        setExercises(exercisesData)
        setMuscleGroups(muscleGroupsData)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load sessions'
        console.error('Error loading sessions:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [date])

  // Decide what to render based on loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem'
      }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    )
  }
  // Decide what to render based on error state
  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.5rem',
        padding: '1rem',
      }}>
        <p style={{ color: '#ef4444' }}>Error: {error}</p>
      </div>
    )
  }

  /* ----- EVENT HANDLERS ----- */

  /*
  Upon adding a new exercise, we may need to create a new session for this date
  if one does not already exist. Then we add the exercise entry to that session.
  Finally we reload the sessions for this date to reflect the new data.
  */
  const handleAddExercise = async () => {
    if (!formData.exercise || !formData.weight) {
      return
    }

    try {
      setSubmitting(true)
      
      // Get or create session for this date
      const dateStr = format(date, 'yyyy-MM-dd')
      let sessionId = sessions[0]?.id
      
      console.log('Current sessions:', sessions)
      console.log('Session ID:', sessionId)
      
      if (!sessionId) {
        // Create a new session for this date
        console.log('Creating new session for date:', dateStr)
        const newSession = await createSession({
          date: dateStr,
          notes: '',
          completed: false
        })
        sessionId = newSession.id
        setSessions([newSession])
        console.log('Created new session:', newSession)
      }

      // Add exercise entry to session
      const entryData = {
        session: sessionId,
        exercise: parseInt(formData.exercise),
        weight: formData.weight,
        status: formData.status
      }
      console.log('Adding session entry with data:', entryData)
      
      await addSessionEntry(entryData)
      console.log('Successfully added session entry')

      // Reload data
      const updatedSessions = await fetchSessions({
        dateFrom: dateStr,
        dateTo: dateStr,
      })
      setSessions(updatedSessions)
      
      // Reset form
      setFormData({ muscleGroup: '', exercise: '', weight: '', status: 'Peak' })
      setShowModal(false)
    } catch (err) {
      console.error('Error details:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEntry = async (entryId: number) => {
    try {
      console.log('Deleting session entry:', entryId)
      await deleteSessionEntry(entryId)
      console.log('Successfully deleted session entry')
      
      const dateStr = format(date, 'yyyy-MM-dd')
      console.log('Reloading sessions for date:', dateStr)
      const updatedSessions = await fetchSessions({
        dateFrom: dateStr,
        dateTo: dateStr,
      })
      console.log('Updated sessions after delete:', updatedSessions)
      
      // Delete any sessions with no entries
      for (const session of updatedSessions) {
        if (session.session_entries.length === 0) {
          console.log('Deleting empty session:', session.id)
          await deleteSession(session.id)
        }
      }
      
      // Reload one more time after deleting empty sessions
      const finalSessions = await fetchSessions({
        dateFrom: dateStr,
        dateTo: dateStr,
      })
      setSessions(finalSessions)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete exercise'
      console.error('Error deleting exercise:', errorMsg, err)
    }
  }

  // Flatten all entries from all sessions for this day
  const allEntries = sessions.flatMap((session) =>
    session.session_entries.map((entry) => ({
      ...entry,
      sessionId: session.id,
      sessionDate: session.date,
    }))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SummaryCards allEntries={allEntries} sessions={sessions} />
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Exercises</h3>
        <button onClick={() => setShowModal(true)} style={{
          background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(6, 182, 212) 100%)',
          border: 'none',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
        }} onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
        }} onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}>
          <Plus style={{ width: '16px', height: '16px' }} />
          Add Exercise
        </button>
      </div>

      <ExercisesTable allEntries={allEntries} onDelete={handleDeleteEntry} />
      
      <AddExerciseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddExercise}
        formData={formData}
        onFormChange={(newData) => setFormData({ ...formData, ...newData })}
        muscleGroups={muscleGroups}
        filteredExercises={filteredExercises}
        isSubmitting={submitting}
      />
    </div>
  )
}
