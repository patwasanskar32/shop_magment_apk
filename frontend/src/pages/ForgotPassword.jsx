import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address')
            return
        }
        setLoading(true)
        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password-email`, { email })
            setSent(true)
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: '2rem' }}>
            <div style={{ maxWidth: 420, width: '100%', padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: 'white' }}>

                {!sent ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forgot Password?</h1>
                            <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Enter your email and we'll send a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <input
                                type="email" placeholder="Your email address" value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ padding: '0.65rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                                disabled={loading}
                            />
                            {error && <p style={{ color: '#f87171', margin: 0, background: 'rgba(239,68,68,0.1)', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.875rem' }}>❌ {error}</p>}
                            <button type="submit" disabled={loading} style={{ padding: '0.8rem', borderRadius: 10, background: loading ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                                {loading ? 'Sending...' : '📧 Send Reset Link'}
                            </button>
                            <p style={{ textAlign: 'center', margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>← Back to Login</Link>
                            </p>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📬</div>
                        <h2 style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>Check your inbox!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            If <strong style={{ color: 'white' }}>{email}</strong> is registered, we've sent a password reset link. Check your inbox (and spam folder).
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>The link expires in 1 hour.</p>
                        <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>← Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
