import { useState } from 'react'
import { login, register, getCurrentUser, User } from '../api/client'
import { Dumbbell, Mail, Lock} from 'lucide-react'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const tokens = await login({ email, password })
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        
        // Get user details
        const user = await getCurrentUser(tokens.access)
        localStorage.setItem('user', JSON.stringify(user))
        onLoginSuccess(user)
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const newUser = await register({
          email,
          password,
          password2: confirmPassword,
          first_name: firstName,
          last_name: lastName,
        })

        // Login after registration
        const tokens = await login({ email, password })
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        localStorage.setItem('user', JSON.stringify(newUser))
        onLoginSuccess(newUser)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      try {
        const parsed = JSON.parse(errorMessage)
        setError(JSON.stringify(parsed, null, 2))
      } catch {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      {/* Logo Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          borderRadius: '0.75rem',
          marginBottom: '1rem'
        }}>
          <Dumbbell style={{ width: '32px', height: '32px', color: 'white' }} />
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #60a5fa 0%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0
        }}>
          Badgers, Barbells & Magpies
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#94a3b8',
          marginTop: '0.5rem'
        }}>
          Care less. Lift more.
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: '0.75rem',
        padding: '2rem',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          padding: '0.25rem',
          borderRadius: '0.5rem'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: isLogin ? '#2563eb' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'white',
              fontWeight: isLogin ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: !isLogin ? '#2563eb' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'white',
              fontWeight: !isLogin ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#fca5a5',
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              {/* First Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  marginBottom: '0.5rem'
                }}>
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  marginBottom: '0.5rem'
                }}>
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  }}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#cbd5e1',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#cbd5e1',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                }}
              />
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#64748b',
                  pointerEvents: 'none'
                }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: loading ? 'rgba(59, 130, 246, 0.5)' : '#2563eb',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'white',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563eb'
            }}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '2rem',
        fontSize: '0.875rem',
        color: '#64748b',
        textAlign: 'center'
      }}>
        © 2026 Badgers, Barbells & Magpies Tracker. All rights reserved.
      </p>
    </div>
  )
}
