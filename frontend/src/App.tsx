import { useState, useEffect } from 'react'
import { DayView } from './views/DayView'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { ExercisesView } from './views/ExercisesView'
import { LoginPage } from './views/LoginPage'
import { ChevronLeft, ChevronRight, Dumbbell, LogOut, Settings } from 'lucide-react'
import { addDays, subDays, addMonths, subMonths, format, startOfWeek, startOfMonth } from 'date-fns'
import { User } from './api/client'

type ViewType = 'day' | 'week' | 'month' | 'exercises'

export default function App() {
  const [view, setView] = useState<ViewType>('day')
  const [date, setDate] = useState(new Date())
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // User is logged in
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

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

  const handleToday = () => {
    setDate(new Date())
    setView('day')
  }

  const handleDayClick = (clickedDate: Date) => {
    setDate(clickedDate)
    setView('day')
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    setShowUserMenu(false)
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(newUser) => setUser(newUser)} />
  }

  const weekStart = startOfWeek(date)
  const monthStart = startOfMonth(date)
  const dateLabel = view === 'day' 
    ? format(date, 'EEEE, MMMM d, yyyy')
    : view === 'week'
    ? `Week of ${format(weekStart, 'MMMM d, yyyy')}`
    : view === 'month'
    ? format(monthStart, 'MMMM yyyy')
    : 'Exercises Library'

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
          {/* Title Section with User Menu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                backgroundClip: 'text',
                margin: 0
              }}>
                Badgers, Barbells & Magpies
              </h1>
            </div>
            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(71, 85, 105, 0.2)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.2)'
                }}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                {user.first_name || user.email}
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  zIndex: 50,
                  minWidth: '200px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                    fontSize: '0.875rem',
                    color: '#cbd5e1'
                  }}>
                    <p style={{ fontWeight: '600', color: 'white', margin: '0 0 0.25rem 0' }}>
                      {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    Logout
                  </button>
                </div>
              )}
            </div>
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
              <button
                onClick={() => setView('exercises')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: view === 'exercises' ? 'rgb(37, 99, 235)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: view === 'exercises' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                Exercises
              </button>
            </div>

            {/* Date Navigation - Only show for calendar views */}
            {view !== 'exercises' && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'center', minWidth: '300px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current Period</p>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }}>
                    {dateLabel}
                  </h2>
                </div>
                <button
                  onClick={handleToday}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(6, 182, 212) 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Today
                </button>
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
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', padding: '3rem 1.5rem', flex: 1 }}>
        {view === 'day' && <DayView date={date} />}
        {view === 'week' && <WeekView startDate={weekStart} onDayClick={handleDayClick} />}
        {view === 'month' && <MonthView startDate={monthStart} onDayClick={handleDayClick} />}
        {view === 'exercises' && <ExercisesView />}
      </main>
    </div>
  )
}
