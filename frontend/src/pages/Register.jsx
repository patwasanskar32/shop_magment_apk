import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username || !email || !password || !confirmPassword || !organizationName) {
            setError('All fields are required')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            await axios.post(`${API_BASE_URL}/auth/register-owner`, {
                username,
                email,
                password,
                organization_name: organizationName
            })
            alert('Owner account created successfully! Please login.')
            navigate('/login')
        } catch (err) {
            console.error('Registration error:', err)
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('❌ Cannot connect to server. Please try again in a minute.')
            } else if (err.response?.data?.detail) {
                setError('❌ ' + err.response.data.detail)
            } else if (err.response?.status === 500) {
                setError('❌ Server error (500). Please wait 1 minute and try again.')
            } else if (err.response?.status === 422) {
                setError('❌ Invalid data. Please check all fields.')
            } else {
                setError('❌ Registration failed: ' + (err.message || 'Please try again.'))
            }
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        padding: '0.65rem 0.9rem', borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.07)', color: 'white',
        fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box'
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',sans-serif", padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
                    <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Register your organization and get started</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <input type="text" placeholder="Organization Name" value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)} style={inputStyle} disabled={loading} />
                    <input type="text" placeholder="Username" value={username}
                        onChange={e => setUsername(e.target.value)} style={inputStyle} disabled={loading} />
                    <input type="email" placeholder="Email address" value={email}
                        onChange={e => setEmail(e.target.value)} style={inputStyle} disabled={loading} />
                    <input type="password" placeholder="Password (min 6 chars)" value={password}
                        onChange={e => setPassword(e.target.value)} style={inputStyle} disabled={loading} />
                    <input type="password" placeholder="Confirm Password" value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} disabled={loading} />

                    {error && (
                        <p style={{ color: '#f87171', margin: 0, fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} style={{
                        padding: '0.8rem', borderRadius: 10, border: 'none', color: 'white', fontWeight: 700, fontSize: '0.98rem', marginTop: '0.3rem',
                        background: loading ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Creating account...' : '🚀 Create Owner Account'}
                    </button>

                    <p style={{ textAlign: 'center', margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register
