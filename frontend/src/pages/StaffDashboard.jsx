import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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
                <h2>Staff Dashboard (ID: {user?.username})</h2>
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
                const res = await axios.get('http://localhost:8000/attendance/my', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setAttendance(res.data)
            } catch (e) { }
        }
        fetchAttendance()
    }, [])

    return (
        <div>
            <h3>My Attendance</h3>
            <ul>
                {attendance.map(a => (
                    <li key={a.id}>
                        {new Date(a.date).toLocaleDateString()} - {a.status} (Marked by: {a.marked_by})
                    </li>
                ))}
            </ul>
        </div>
    )
}

const MyMessages = ({ token }) => {
    const [inbox, setInbox] = useState([])
    const [replyMsg, setReplyMsg] = useState('')

    const fetchInbox = async () => {
        try {
            const res = await axios.get('http://localhost:8000/message/inbox', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setInbox(res.data)
        } catch (e) { }
    }

    useEffect(() => { fetchInbox() }, [])

    const sendReply = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:8000/message/reply', { message: replyMsg }, {
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
