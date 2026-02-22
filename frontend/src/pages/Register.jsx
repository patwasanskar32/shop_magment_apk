import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

const Register = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!username || !password || !confirmPassword || !organizationName) {
            setError('All fields are required')
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
            const res = await axios.post(`${API_BASE_URL}/auth/register-owner`, {
                username,
                password,
                organization_name: organizationName
            })
            alert('Owner account created successfully! Please login.')
            navigate('/login')
        } catch (err) {
            console.error('Registration error:', err)
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                setError('❌ Cannot connect to server. Check your internet or try again in a minute.')
            } else if (err.response?.data?.detail) {
                setError('❌ ' + err.response.data.detail)
            } else if (err.response?.status === 500) {
                setError('❌ Server error (500). The server is starting up, please wait 1 minute and try again.')
            } else if (err.response?.status === 422) {
                setError('❌ Invalid data. Please check all fields.')
            } else {
                setError('❌ Registration failed: ' + (err.message || 'Please try again.'))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h1>Create Owner Account</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
                Register your organization and create an owner account
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', margin: 'auto' }}>
                <input
                    type="text"
                    placeholder="Organization Name"
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    style={{ padding: '0.5rem' }}
                    disabled={loading}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ padding: '0.5rem' }}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ padding: '0.5rem' }}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ padding: '0.5rem' }}
                    disabled={loading}
                />
                {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Owner Account'}
                </button>
                <Link to="/login" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    Back to Login
                </Link>
            </form>
        </div>
    )
}

export default Register
