import { Session, SessionEntry } from '../api/client'

interface SummaryCardsProps {
  allEntries: SessionEntry[]
  sessions: Session[]
}

export function SummaryCards({ allEntries, sessions }: SummaryCardsProps) {
  return (
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
  )
}
