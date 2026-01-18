import { useState } from 'react'
import { DayView } from './views/DayView'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { Button } from './components/ui/button'
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import { addDays, subDays, addMonths, subMonths, format, startOfWeek, startOfMonth } from 'date-fns'

type ViewType = 'day' | 'week' | 'month'

export default function App() {
  const [view, setView] = useState<ViewType>('day')
  const [date, setDate] = useState(new Date())

  const handlePrevious = () => {
    if (view === 'day') {
      setDate(subDays(date, 1))
    } else if (view === 'week') {
      setDate(subDays(date, 7))
    } else {
      setDate(subMonths(date, 1))
    }
  }

  const handleNext = () => {
    if (view === 'day') {
      setDate(addDays(date, 1))
    } else if (view === 'week') {
      setDate(addDays(date, 7))
    } else {
      setDate(addMonths(date, 1))
    }
  }

  const weekStart = startOfWeek(date)
  const monthStart = startOfMonth(date)
  const dateLabel = view === 'day' 
    ? format(date, 'EEEE, MMMM d, yyyy')
    : view === 'week'
    ? `Week of ${format(weekStart, 'MMMM d, yyyy')}`
    : format(monthStart, 'MMMM yyyy')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)', 
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        padding: '2rem 1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Title Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              borderRadius: '0.5rem'
            }}>
              <Dumbbell style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: '2.25rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #60a5fa 0%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Fitness Tracker
            </h1>
          </div>
          
          {/* Controls Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* View Toggle */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              padding: '0.25rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setView('day')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: view === 'day' ? 'rgb(37, 99, 235)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'day' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                Day View
              </button>
              <button
                onClick={() => setView('week')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: view === 'week' ? 'rgb(37, 99, 235)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'week' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                Week View
              </button>
              <button
                onClick={() => setView('month')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: view === 'month' ? 'rgb(37, 99, 235)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'month' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                Month View
              </button>
            </div>

            {/* Date Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
              <button
                onClick={handlePrevious}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.2)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#cbd5e1'
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
                Prev
              </button>
              <div style={{ textAlign: 'center', minWidth: '300px' }}>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current Period</p>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }}>
                  {dateLabel}
                </h2>
              </div>
              <button
                onClick={handleNext}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.2)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#cbd5e1'
                }}
              >
                Next
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', padding: '3rem 1.5rem', flex: 1 }}>
        {view === 'day' && <DayView date={date} />}
        {view === 'week' && <WeekView startDate={weekStart} />}
        {view === 'month' && <MonthView startDate={monthStart} />}
      </main>
    </div>
  )
}
