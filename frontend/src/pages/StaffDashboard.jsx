import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('attendance')

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <div style={{ textAlign: 'left', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Staff Dashboard ({user?.username})</h2>
                <button onClick={logout}>Logout</button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                <button onClick={() => setActiveTab('attendance')} disabled={activeTab === 'attendance'}>My Attendance</button>
                <button onClick={() => setActiveTab('messages')} disabled={activeTab === 'messages'}>Messages</button>
            </div>

            <div className="card">
                {activeTab === 'attendance' && <MyAttendance token={user?.token} />}
                {activeTab === 'messages' && <MyMessages token={user?.token} />}
            </div>
        </div>
    )
}

const MyAttendance = ({ token }) => {
    const [attendance, setAttendance] = useState([])

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/attendance/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setAttendance(res.data)
            } catch (e) { console.error(e) }
        }
        fetchAttendance()
    }, [])

    return (
        <div>
            <h3>📋 My Attendance Records</h3>

            {/* Attendance Table - Same as Owner Dashboard */}
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(102, 126, 234, 0.5)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4facfe' }}>IN Time</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#f5576c' }}>OUT Time</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Marked By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map(a => {
                            const dateObj = new Date(a.date);
                            const checkInTime = a.check_in_time ? new Date(a.check_in_time) : null;
                            const checkOutTime = a.check_out_time ? new Date(a.check_out_time) : null;

                            return (
                                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{dateObj.toLocaleDateString('en-GB')}</td>
                                    <td style={{ padding: '1rem', color: '#4facfe', fontWeight: '500' }}>
                                        {checkInTime ? checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#f5576c', fontWeight: '500' }}>
                                        {checkOutTime ? checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '20px',
                                            background: a.status === 'Present' ? 'rgba(79, 172, 254, 0.2)' :
                                                a.status === 'Late' ? 'rgba(245, 87, 108, 0.2)' :
                                                    'rgba(160, 174, 192, 0.2)',
                                            border: `1px solid ${a.status === 'Present' ? 'rgba(79, 172, 254, 0.4)' :
                                                a.status === 'Late' ? 'rgba(245, 87, 108, 0.4)' :
                                                    'rgba(160, 174, 192, 0.4)'}`,
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'rgba(160, 174, 192, 0.8)' }}>
                                        {a.marked_by}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {attendance.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'rgba(160, 174, 192, 0.6)', fontSize: '1rem' }}>
                        No attendance records yet. Your attendance will appear here once marked! 📝
                    </p>
                )}
            </div>
        </div>
    )
}

const MyMessages = ({ token }) => {
    const [inbox, setInbox] = useState([])
    const [replyMsg, setReplyMsg] = useState('')

    const fetchInbox = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/message/inbox`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setInbox(res.data)
        } catch (e) { }
    }

    useEffect(() => { fetchInbox() }, [])

    const sendReply = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/message/reply`, { message: replyMsg }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Reply Sent')
            setReplyMsg('')
        } catch (e) { alert('Error sending reply') }
    }

    return (
        <div>
            <h3>Messages</h3>
            <div style={{ marginBottom: '2rem' }}>
                <h4>Inbox</h4>
                {inbox.length === 0 ? <p>No messages</p> : (
                    <ul>
                        {inbox.map(m => (
                            <li key={m.id} style={{ borderBottom: '1px solid #444', padding: '0.5rem' }}>
                                <strong>{m.type.toUpperCase()}:</strong> {m.message} <br />
                                <small>{new Date(m.timestamp).toLocaleString()}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <form onSubmit={sendReply}>
                <h4>Send Reply to Owner</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Type reply..." required style={{ flex: 1 }} />
                    <button type="submit">Reply</button>
                </div>
            </form>
        </div>
    )
}

export default StaffDashboard
