import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fetchSessions, Session, fetchExercises, Exercise, fetchMuscleGroups, MuscleGroup, createSession, addSessionEntry, deleteSessionEntry, deleteSession } from '../api/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Button } from '../components/ui/button'
import { Trash2, Plus, X } from 'lucide-react'

interface DayViewProps {
  date: Date
}

export function DayView({ date }: DayViewProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    muscleGroup: '',
    exercise: '',
    weight: '',
    status: 'Peak'
  })
  const [submitting, setSubmitting] = useState(false)

  // Filter exercises by selected muscle group
  const filteredExercises = formData.muscleGroup
    ? exercises.filter(ex => ex.muscle_group.id === parseInt(formData.muscleGroup))
    : exercises

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    )
  }

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
      const errorMsg = err instanceof Error ? err.message : 'Failed to add exercise'
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
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
        }} onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8' }}>Total Exercises</p>
              <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>{allEntries.length}</p>
            </div>
            <div style={{ fontSize: '2.25rem', opacity: 0.2 }}>💪</div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
        }} onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8' }}>Completed</p>
              <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>
                {sessions.filter((s) => s.completed).length}
              </p>
            </div>
            <div style={{ fontSize: '2.25rem', opacity: 0.2 }}>✓</div>
          </div>
        </div>
      </div>

      {/* Exercises Table */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
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

        {allEntries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '1.125rem' }}>No exercises recorded for this day</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                  <TableHead style={{ color: '#cbd5e1', fontWeight: '600' }}>Exercise</TableHead>
                  <TableHead style={{ color: '#cbd5e1', fontWeight: '600' }}>Muscle Group</TableHead>
                  <TableHead style={{ color: '#cbd5e1', fontWeight: '600' }}>Type</TableHead>
                  <TableHead style={{ color: '#cbd5e1', fontWeight: '600' }}>Weight</TableHead>
                  <TableHead style={{ color: '#cbd5e1', fontWeight: '600' }}>Status</TableHead>
                  <TableHead style={{ textAlign: 'right', color: '#cbd5e1', fontWeight: '600' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEntries.map((entry) => (
                  <TableRow key={entry.id} style={{
                    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                    transition: 'all 0.2s'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.1)'
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}>
                    <TableCell style={{ fontWeight: '500', color: 'white' }}>
                      {entry.exercise.exercise_name}
                    </TableCell>
                    <TableCell style={{ color: '#cbd5e1' }}>{entry.exercise.muscle_group.muscle_group_name}</TableCell>
                    <TableCell style={{ color: '#cbd5e1' }}>{entry.exercise.exercise_type.type_name}</TableCell>
                    <TableCell style={{ color: '#cbd5e1', fontWeight: '600' }}>{entry.weight}</TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: '1px solid',
                        backgroundColor: entry.status === 'Peak'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : entry.status === 'Static'
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(100, 116, 139, 0.1)',
                        color: entry.status === 'Peak'
                          ? '#86efac'
                          : entry.status === 'Static'
                          ? '#93c5fd'
                          : '#cbd5e1',
                        borderColor: entry.status === 'Peak'
                          ? 'rgba(34, 197, 94, 0.3)'
                          : entry.status === 'Static'
                          ? 'rgba(59, 130, 246, 0.3)'
                          : 'rgba(100, 116, 139, 0.3)'
                      }}>
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'transparent',
                          color: '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                          e.currentTarget.style.color = '#f87171'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#94a3b8'
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Add Exercise</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Muscle Group Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                  Muscle Group
                </label>
                <select
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value, exercise: '' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: 'white',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Select a muscle group</option>
                  {muscleGroups.map((mg) => (
                    <option key={mg.id} value={mg.id}>
                      {mg.muscle_group_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exercise Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                  Exercise
                </label>
                <select
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                  disabled={!formData.muscleGroup}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: formData.muscleGroup ? 'white' : '#64748b',
                    fontSize: '0.875rem',
                    opacity: formData.muscleGroup ? 1 : 0.5,
                    cursor: formData.muscleGroup ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Select an exercise</option>
                  {filteredExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.exercise_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight Input */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 20kg"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: 'white',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: 'white',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="Peak">Peak</option>
                  <option value="Static">Static</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={handleAddExercise}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(6, 182, 212) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Adding...' : 'Add Exercise'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(71, 85, 105, 0.2)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.375rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
