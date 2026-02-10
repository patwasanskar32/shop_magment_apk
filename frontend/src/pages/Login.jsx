import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import API_BASE_URL from '../config'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const res = await axios.post(`${API_BASE_URL}/auth/login`, formData)
            const token = res.data.access_token
            // Decode JWT to get role (simple implementation)
            const payload = JSON.parse(atob(token.split('.')[1]))
            login(token, { username: payload.sub, role: payload.role })

            if (payload.role === 'owner') navigate('/owner')
            else navigate('/staff')
        } catch (err) {
            console.error(err)
            setError('Invalid credentials')
        }
    }

    return (
        <div className="card">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', margin: 'auto' }}>
                <input
                    type="text" placeholder="Username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    style={{ padding: '0.5rem' }}
                />
                <input
                    type="password" placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ padding: '0.5rem' }}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
                <Link to="/register" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    Don't have an account? Register your organization
                </Link>
            </form>
        </div>
    )
}

export default Login

