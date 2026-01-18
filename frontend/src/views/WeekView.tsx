import { useEffect, useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
} from 'date-fns'
import { fetchSessions, Session } from '../api/client'

interface WeekViewProps {
  startDate: Date
}

interface DayStats {
  date: Date
  exercises: number
  sessions: number
  completed: boolean
  muscleGroups: Set<string>
}

export function WeekView({ startDate }: WeekViewProps) {
  const [stats, setStats] = useState<DayStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 })

        const data = await fetchSessions({
          dateFrom: format(weekStart, 'yyyy-MM-dd'),
          dateTo: format(weekEnd, 'yyyy-MM-dd'),
        })

        // Group by date
        const dateMap = new Map<string, Session[]>()
        data.forEach((session) => {
          const dateKey = session.date
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, [])
          }
          dateMap.get(dateKey)!.push(session)
        })

        // Create stats for each day of the week
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
        const dayStats = days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const sessions = dateMap.get(dateKey) || []

          const muscleGroups = new Set<string>()
          sessions.forEach((session) => {
            session.session_entries.forEach((entry) => {
              muscleGroups.add(entry.exercise.muscle_group.muscle_group_name)
            })
          })

          return {
            date: day,
            exercises: sessions.reduce((total, s) => total + s.session_entries.length, 0),
            sessions: sessions.length,
            completed: sessions.some((s) => s.completed),
            muscleGroups,
          }
        })

        setStats(dayStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [startDate])

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

  const totalExercises = stats.reduce((sum, day) => sum + day.exercises, 0)
  const completedDays = stats.filter((day) => day.completed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
      }}>
        {[
          { label: 'Total Exercises', value: totalExercises },
          { label: 'Days Worked Out', value: stats.filter((s) => s.sessions > 0).length },
          { label: 'Completed Days', value: completedDays },
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              padding: '1.5rem',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8', marginBottom: '0.5rem' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#e2e8f0' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' }}>
          Week Overview
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
        }}>
          {stats.map((day) => {
            const isCurrentDay = isToday(day.date)
            const hasExercises = day.sessions > 0
            let borderColor = 'rgba(71, 85, 105, 0.3)'
            let bgColor = 'rgba(30, 41, 59, 0.4)'
            
            if (isCurrentDay) {
              borderColor = 'rgba(59, 130, 246, 0.5)'
              bgColor = 'rgba(59, 130, 246, 0.1)'
            } else if (hasExercises) {
              borderColor = 'rgba(34, 197, 94, 0.5)'
              bgColor = 'rgba(34, 197, 94, 0.1)'
            }

            return (
              <div
                key={format(day.date, 'yyyy-MM-dd')}
                style={{
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: `2px solid ${borderColor}`,
                  background: bgColor,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.7)'
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    {format(day.date, 'EEE')}
                  </p>
                  {day.completed && (
                    <span style={{
                      display: 'inline-block',
                      width: '0.5rem',
                      height: '0.5rem',
                      background: '#22c55e',
                      borderRadius: '50%',
                    }}></span>
                  )}
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e2e8f0' }}>
                  {day.exercises}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>exercises</p>
                {day.muscleGroups.size > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {Array.from(day.muscleGroups)
                      .slice(0, 2)
                      .map((mg) => (
                        <span
                          key={mg}
                          style={{
                            fontSize: '0.625rem',
                            background: 'rgba(100, 116, 139, 0.3)',
                            color: '#cbd5e1',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(100, 116, 139, 0.2)',
                          }}
                        >
                          {mg.slice(0, 3)}
                        </span>
                      ))}
                    {day.muscleGroups.size > 2 && (
                      <span style={{
                        fontSize: '0.625rem',
                        background: 'rgba(100, 116, 139, 0.3)',
                        color: '#cbd5e1',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid rgba(100, 116, 139, 0.2)',
                      }}>
                        +{day.muscleGroups.size - 2}
                      </span>
                    )}
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {format(day.date, 'MMM d')}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Muscle Group Distribution */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' }}>
          Muscle Groups
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(() => {
            const muscleGroupCounts = new Map<string, number>()
            stats.forEach((day) => {
              day.muscleGroups.forEach((mg) => {
                muscleGroupCounts.set(mg, (muscleGroupCounts.get(mg) || 0) + 1)
              })
            })

            if (muscleGroupCounts.size === 0) {
              return <p style={{ color: '#64748b' }}>No muscle groups trained this week</p>
            }

            return Array.from(muscleGroupCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([mg, count]) => (
                <div key={mg} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1' }}>{mg}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8rem',
                      background: 'rgba(100, 116, 139, 0.2)',
                      borderRadius: '9999px',
                      height: '0.5rem',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                    }}>
                      <div
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                          height: '0.5rem',
                          borderRadius: '9999px',
                          width: `${(count / 7) * 100}%`,
                          transition: 'width 0.3s',
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', width: '2rem', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))
          })()}
        </div>
      </div>
    </div>
  )
}
