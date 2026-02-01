import { SessionEntry } from '../api/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Trash2 } from 'lucide-react'

interface ExercisesTableProps {
  allEntries: SessionEntry[]
  onDelete: (entryId: number) => void
}

export function ExercisesTable({ allEntries, onDelete }: ExercisesTableProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      backdropFilter: 'blur(12px)',
      overflow: 'hidden'
    }}>
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
                      onClick={() => onDelete(entry.id)}
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
  )
}
