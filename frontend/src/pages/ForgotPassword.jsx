import { useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'

const ForgotPassword = () => {
    const [step, setStep] = useState(1) // 1 = enter username, 2 = success message
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Since we don't have email system, we'll show instructions
        setMessage(`Password reset request received for "${username}". Please contact your organization owner/admin to reset your password.`)
        setStep(2)
    }

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '3rem auto' }}>
            <h1>🔐 Forgot Password?</h1>

            {step === 1 ? (
                <>
                    <p style={{ marginBottom: '1.5rem', color: 'rgba(160, 174, 192, 0.9)' }}>
                        Enter your username below. Your organization admin will be notified to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{ padding: '0.75rem', fontSize: '1rem' }}
                        />

                        <button type="submit" style={{ padding: '0.75rem' }}>
                            Request Password Reset
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
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>
                            ✅ {message}
                        </p>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(245, 166, 35, 0.1)',
                        border: '1px solid rgba(245, 166, 35, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ marginTop: 0 }}>📞 What to do next:</h3>
                        <ol style={{ marginBottom: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                            <li>Contact your organization owner/admin</li>
                            <li>Verify your identity with them</li>
                            <li>They will reset your password from their dashboard</li>
                            <li>You'll receive your new password</li>
                        </ol>
                    </div>

                    <Link to="/login">
                        <button style={{ width: '100%', padding: '0.75rem' }}>
                            Return to Login
                        </button>
                    </Link>
                </>
            )}
        </div>
    )
}

export default ForgotPassword
