import { useState, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
import { fetchExercises, createExercise } from '../api/client'
import type { Exercise } from '../api/client'

export function ExercisesView() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All')
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    exercise_name: '',
    muscle_group: '',
    exercise_type: ''
  })

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await fetchExercises()
      setExercises(data)
      
      // Extract unique muscle groups
      const groups = Array.from(
        new Set(data.map(ex => ex.muscle_group?.muscle_group_name).filter(Boolean))
      ).sort() as string[]
      setMuscleGroups(groups)
      
      // Show all exercises initially
      setFilteredExercises(data)
      setError(null)
    } catch (err) {
      setError('Failed to load exercises')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (group: string) => {
    setSelectedMuscleGroup(group)
    if (group === 'All') {
      setFilteredExercises(exercises)
    } else {
      setFilteredExercises(
        exercises.filter(ex => ex.muscle_group?.muscle_group_name === group)
      )
    }
  }

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.exercise_name || !formData.muscle_group) {
      alert('Exercise name and muscle group are required')
      return
    }

    try {
      await createExercise({
        exercise_name: formData.exercise_name,
        muscle_group_name: formData.muscle_group,
        exercise_type_name: formData.exercise_type || undefined
      })
      
      setFormData({ exercise_name: '', muscle_group: '', exercise_type: '' })
      setShowAddForm(false)
      await loadExercises()
    } catch (err) {
      alert('Failed to create exercise')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading exercises...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <h1 style={{ margin: 0, color: '#e2e8f0', fontSize: '2rem' }}>Exercises Library</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d64700'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
        >
          <Plus size={20} />
          Add Exercise
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#cbd5e1', marginTop: 0 }}>Add New Exercise</h2>
          <form onSubmit={handleAddExercise} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Exercise Name *
              </label>
              <input
                type="text"
                value={formData.exercise_name}
                onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="e.g., Bench Press"
              />
            </div>
            
            <div>
              <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Muscle Group *
              </label>
              <select
                value={formData.muscle_group}
                onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select muscle group</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Exercise Type
              </label>
              <input
                type="text"
                value={formData.exercise_type}
                onChange={(e) => setFormData({ ...formData, exercise_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="e.g., Barbell, Cable, Dumbell"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#475569',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add Exercise
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
          <Filter size={18} />
          <span>Filter by:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', ...muscleGroups].map(group => (
            <button
              key={group}
              onClick={() => handleFilterChange(group)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedMuscleGroup === group ? '#ea580c' : '#1e293b',
                color: selectedMuscleGroup === group ? 'white' : '#cbd5e1',
                border: selectedMuscleGroup === group ? 'none' : '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: selectedMuscleGroup === group ? '600' : '400',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedMuscleGroup !== group) {
                  e.currentTarget.style.backgroundColor = '#334155'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMuscleGroup !== group) {
                  e.currentTarget.style.backgroundColor = '#1e293b'
                }
              }}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#7f1d1d',
          color: '#fca5a5',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        overflowX: 'auto',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem'
        }}>
          <thead>
            <tr style={{
              borderBottom: '2px solid rgba(71, 85, 105, 0.5)',
              backgroundColor: 'rgba(15, 23, 42, 0.5)'
            }}>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                color: '#cbd5e1',
                fontWeight: '600',
                minWidth: '250px'
              }}>
                Exercise Name
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                color: '#cbd5e1',
                fontWeight: '600',
                width: '180px'
              }}>
                Muscle Group
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                color: '#cbd5e1',
                fontWeight: '600',
                width: '150px'
              }}>
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExercises.map((exercise, idx) => (
              <tr
                key={exercise.id}
                style={{
                  borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(71, 85, 105, 0.1)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(71, 85, 105, 0.1)'
                }}
              >
                <td style={{
                  padding: '0.875rem 1rem',
                  color: '#e2e8f0',
                  fontWeight: '500'
                }}>
                  {exercise.exercise_name}
                </td>
                <td style={{
                  padding: '0.875rem 1rem',
                  color: '#cbd5e1'
                }}>
                  {exercise.muscle_group?.muscle_group_name || '—'}
                </td>
                <td style={{
                  padding: '0.875rem 1rem',
                  color: '#cbd5e1'
                }}>
                  {exercise.exercise_type?.type_name || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredExercises.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
          No exercises found in this category
        </div>
      )}
    </div>
  )
}
