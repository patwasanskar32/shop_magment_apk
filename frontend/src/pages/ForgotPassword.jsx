import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

const ForgotPassword = () => {
    const [step, setStep] = useState(1) // 1 = enter details, 2 = success message
    const [username, setUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate password length
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters')
            return
        }

        setLoading(true)

        try {
            await axios.post(`${API_BASE_URL}/auth/self-reset-password`, {
                username: username,
                new_password: newPassword
            })

            setStep(2)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error resetting password. Please check your username.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '3rem auto' }}>
            <h1>🔐 Reset Password</h1>

            {step === 1 ? (
                <>
                    <p style={{ marginBottom: '1.5rem', color: 'rgba(160, 174, 192, 0.9)' }}>
                        Enter your username and create a new password.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{ padding: '0.75rem', fontSize: '1rem' }}
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            style={{ padding: '0.75rem', fontSize: '1rem' }}
                        />

                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={{ padding: '0.75rem', fontSize: '1rem' }}
                        />

                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(245, 87, 108, 0.1)',
                                border: '1px solid rgba(245, 87, 108, 0.3)',
                                borderRadius: '8px',
                                color: '#f5576c'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: '0.75rem', opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <Link to="/login" style={{ textAlign: 'center', marginTop: '0.5rem', color: 'rgba(102, 126, 234, 0.8)' }}>
                            ← Back to Login
                        </Link>
                    </form>
                </>
            ) : (
                <>
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(79, 172, 254, 0.1)',
                        border: '1px solid rgba(79, 172, 254, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ color: '#4facfe', marginTop: 0 }}>✅ Success!</h2>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>
                            Your password has been reset successfully.
                        </p>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ marginTop: 0 }}>📝 Next Steps:</h3>
                        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                            <li>Your password for <strong>{username}</strong> has been updated</li>
                            <li>You can now login with your new password</li>
                            <li>Make sure to remember your new password</li>
                        </ul>
                    </div>

                    <Link to="/login">
                        <button style={{ width: '100%', padding: '0.75rem' }}>
                            Go to Login
                        </button>
                    </Link>
                </>
            )}
        </div>
    )
}

export default ForgotPassword
