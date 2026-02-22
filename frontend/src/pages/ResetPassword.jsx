import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState('form') // form | success | error
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newPassword || newPassword !== confirmPassword) {
            setMessage('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters')
            return
        }
        setLoading(true)
        setMessage('')
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/reset-password-token`, { token, new_password: newPassword })
            setStatus('success')
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || 'Reset failed. The link may have expired.')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = { padding: '0.65rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', outline: 'none' }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: '2rem' }}>
            <div style={{ maxWidth: 420, width: '100%', padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: 'white' }}>

                {status === 'form' && !token && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: '#f87171' }}>Invalid Link</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>No reset token found. Please request a new password reset.</p>
                        <Link to="/forgot-password" style={{ color: '#a78bfa' }}>← Forgot Password</Link>
                    </div>
                )}

                {status === 'form' && token && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#f5576c,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Set New Password</h1>
                            <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Choose a strong new password</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} disabled={loading} />
                            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} disabled={loading} />

                            {message && <p style={{ color: '#f87171', margin: 0, background: 'rgba(239,68,68,0.1)', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.875rem' }}>❌ {message}</p>}

                            <button type="submit" disabled={loading} style={{ padding: '0.8rem', borderRadius: 10, background: loading ? 'rgba(245,87,108,0.4)' : 'linear-gradient(135deg,#f5576c,#f093fb)', border: 'none', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.98rem' }}>
                                {loading ? 'Saving...' : '🔑 Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {status === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>Password Reset!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Your password has been updated. You can now sign in.</p>
                        <button onClick={() => navigate('/login')} style={{ padding: '0.8rem 2rem', borderRadius: 10, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                            Go to Login →
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❌</div>
                        <h2 style={{ color: '#f87171', margin: '0 0 1rem' }}>Reset Failed</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>{message}</p>
                        <Link to="/forgot-password" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>← Request new reset link</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
