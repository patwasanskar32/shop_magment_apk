import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('verifying') // verifying | success | error
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) { setStatus('error'); setMessage('No verification token found.'); return }

        axios.get(`${API_BASE_URL}/auth/verify-email?token=${token}`)
            .then(res => { setStatus('success'); setMessage(res.data.message) })
            .catch(err => { setStatus('error'); setMessage(err.response?.data?.detail || 'Verification failed. The link may have expired.') })
    }, [])

    const inputStyle = { minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }

    return (
        <div style={inputStyle}>
            <div style={{ maxWidth: 440, padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, textAlign: 'center', color: 'white' }}>
                {status === 'verifying' && <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <h2>Verifying your email...</h2>
                </>}

                {status === 'success' && <>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>Email Verified!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>{message}</p>
                    <button onClick={() => navigate('/login')} style={{ padding: '0.8rem 2rem', borderRadius: 10, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                        Go to Login →
                    </button>
                </>}

                {status === 'error' && <>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❌</div>
                    <h2 style={{ color: '#f87171', margin: '0 0 1rem' }}>Verification Failed</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>{message}</p>
                    <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>← Register again</Link>
                </>}
            </div>
        </div>
    )
}
