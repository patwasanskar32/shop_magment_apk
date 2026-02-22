import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

/**
 * Wait until the Render server process is truly awake.
 * Uses axios.get('/health') — a simple GET that needs no CORS preflight.
 * This actually hits the Render server process (NOT Cloudflare's edge),
 * so we know the process is ready when it returns 200.
 *
 * Returns true when ready, false if timed out (90s max).
 */
async function waitForServer(onTick) {
    const startAt = Date.now()
    const MAX_MS = 90_000

    const tick = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startAt) / 1000)
        onTick(elapsed)
    }, 1000)

    try {
        while (Date.now() - startAt < MAX_MS) {
            try {
                // Simple GET → no preflight, goes straight to Render process
                await axios.get(`${API_BASE_URL}/health`, { timeout: 12000 })
                return true  // server is genuinely awake
            } catch {
                // still sleeping — wait 5s and retry
                await sleep(5000)
            }
        }
        return false
    } finally {
        clearInterval(tick)
    }
}

export default function Register() {
    const [form, setForm] = useState({ org: '', username: '', email: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [phase, setPhase] = useState('') // '' | 'checking' | 'waking' | 'submitting'
    const navigate = useNavigate()

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSeconds(0)
        setPhase('')

        const { org, username, email, password, confirm } = form
        if (!org || !username || !email || !password || !confirm) { setError('All fields are required'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return }
        if (password !== confirm) { setError('Passwords do not match'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return }

        setLoading(true)

        // Step 1: quick check if server is already awake (12s timeout)
        setPhase('checking')
        let serverReady = false
        try {
            await axios.get(`${API_BASE_URL}/health`, { timeout: 12000 })
            serverReady = true
        } catch {
            // server sleeping — need to wait
        }

        if (!serverReady) {
            // Step 2: poll until server wakes (up to 90s)
            setPhase('waking')
            serverReady = await waitForServer(setSeconds)
            if (!serverReady) {
                setError('❌ Server is taking too long to start. Please try again in a moment.')
                setLoading(false)
                setPhase('')
                return
            }
        }

        // Step 3: server is awake — submit registration
        setPhase('submitting')
        try {
            await axios.post(`${API_BASE_URL}/auth/register-owner`, {
                username,
                email,
                password,
                organization_name: org
            }, { timeout: 30000 })

            setPhase('')
            alert('✅ Account created! Please check your email to verify your address.')
            navigate('/login')

        } catch (err) {
            setPhase('')
            if (err.response?.data?.detail) {
                setError('❌ ' + err.response.data.detail)
            } else if (err.response?.status === 422) {
                setError('❌ Invalid data. Check all fields and try again.')
            } else if (err.code === 'ECONNABORTED') {
                setError('❌ Server timed out. Please try again.')
            } else {
                setError('❌ ' + (err.message || 'Registration failed. Please try again.'))
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

    const statusText = {
        checking: '🔌 Checking server...',
        waking: `⏳ Waking up server... ${seconds}s`,
        submitting: '✅ Server ready — creating account...',
    }[phase] || ''

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',sans-serif", padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
                    <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Register your organization and get started</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <input type="text" placeholder="Organization Name" value={form.org} onChange={set('org')} style={inputStyle} disabled={loading} />
                    <input type="text" placeholder="Username" value={form.username} onChange={set('username')} style={inputStyle} disabled={loading} />
                    <input type="email" placeholder="Email address" value={form.email} onChange={set('email')} style={inputStyle} disabled={loading} />
                    <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} style={inputStyle} disabled={loading} />
                    <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={set('confirm')} style={inputStyle} disabled={loading} />

                    {statusText && (
                        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '0.75rem 0.9rem' }}>
                            <div style={{ color: '#93c5fd', fontSize: '0.875rem', marginBottom: phase === 'waking' ? '0.5rem' : 0 }}>
                                {statusText}
                            </div>
                            {phase === 'waking' && (
                                <>
                                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: 'linear-gradient(90deg,#667eea,#f093fb)', width: `${Math.min(100, (seconds / 90) * 100)}%`, transition: 'width 1s linear', borderRadius: 2 }} />
                                    </div>
                                    <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                                        Free tier servers sleep after 15 min — please wait up to 90s
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {error && (
                        <p style={{ color: '#f87171', margin: 0, fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} style={{
                        padding: '0.8rem', borderRadius: 10, border: 'none', color: 'white',
                        fontWeight: 700, fontSize: '0.98rem', marginTop: '0.3rem',
                        background: loading ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Please wait...' : '🚀 Create Owner Account'}
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
