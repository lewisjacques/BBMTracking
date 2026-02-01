import { Exercise, MuscleGroup } from '../api/client'
import { X, Plus } from 'lucide-react'

interface FormData {
  muscleGroup: string
  exercise: string
  weight: string
  status: 'Peak' | 'Static' | 'Other'
}

interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  formData: FormData
  onFormChange: (newData: Partial<FormData>) => void
  muscleGroups: MuscleGroup[]
  filteredExercises: Exercise[]
  isSubmitting: boolean
}

export function AddExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  muscleGroups,
  filteredExercises,
  isSubmitting,
}: AddExerciseModalProps) {
  if (!isOpen) return null

  return (
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
            onClick={onClose}
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
              onChange={(e) => onFormChange({ muscleGroup: e.target.value, exercise: '' })}
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
              onChange={(e) => onFormChange({ exercise: e.target.value })}
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
              onChange={(e) => onFormChange({ weight: e.target.value })}
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
              onChange={(e) => onFormChange({ status: e.target.value as 'Peak' | 'Static' | 'Other' })}
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
              onClick={onSubmit}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(6, 182, 212) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Exercise'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'rgba(71, 85, 105, 0.2)',
                color: '#cbd5e1',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '0.375rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
