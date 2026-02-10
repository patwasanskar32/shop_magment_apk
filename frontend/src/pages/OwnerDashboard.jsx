import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

const OwnerDashboard = () => {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('staff')

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <div style={{ textAlign: 'left', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Owner Dashboard</h2>
                <button onClick={logout}>Logout</button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                <button onClick={() => setActiveTab('staff')} disabled={activeTab === 'staff'}>Staff</button>
                <button onClick={() => setActiveTab('attendance')} disabled={activeTab === 'attendance'}>Attendance</button>
                <button onClick={() => setActiveTab('messages')} disabled={activeTab === 'messages'}>Messages</button>
            </div>

            <div className="card">
                {activeTab === 'staff' && <StaffManager token={user?.token} />}
                {activeTab === 'attendance' && <AttendanceManager token={user?.token} />}
                {activeTab === 'messages' && <MessageManager token={user?.token} />}
            </div>
        </div>
    )
}

const StaffManager = ({ token }) => {
    const [staff, setStaff] = useState([])
    const [newStaff, setNewStaff] = useState({ username: '', password: '' })

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/staff/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStaff(res.data)
        } catch (e) { alert('Error fetching staff') }
    }

    useEffect(() => { fetchStaff() }, [])

    const addStaff = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/staff/add`, newStaff, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNewStaff({ username: '', password: '' })
            fetchStaff()
        } catch (e) { alert('Error adding staff') }
    }

    const deleteStaff = async (id) => {
        if (!confirm('Delete staff?')) return
        try {
            await axios.delete(`${API_BASE_URL}/staff/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchStaff()
        } catch (e) { alert('Error deleting staff') }
    }

    return (
        <div>
            <h3>Staff Management</h3>
            <form onSubmit={addStaff} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input placeholder="Username" value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} required />
                <input placeholder="Password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} required />
                <button type="submit">Add Staff</button>
            </form>
            <ul>
                {staff.map(s => (
                    <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}>
                        {s.username} (ID: {s.id})
                        <button onClick={() => deleteStaff(s.id)} style={{ backgroundColor: 'red', color: 'white', padding: '0.2rem 0.5rem' }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const AttendanceManager = ({ token }) => {
    const [attendance, setAttendance] = useState([])
    const [manual, setManual] = useState({ user_id: '', status: 'Present' })
    const [barcode, setBarcode] = useState('')

    const fetchAttendance = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/attendance/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAttendance(res.data)
        } catch (e) { console.error(e) }
    }

    useEffect(() => { fetchAttendance() }, [])

    const markManual = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/attendance/mark`, manual, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchAttendance()
        } catch (e) { alert('Error marking attendance') }
    }

    const markBarcode = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/attendance/barcode`, { barcode }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBarcode('')
            fetchAttendance()
            alert('Marked via Barcode!')
        } catch (e) { alert('Error/Already Marked') }
    }

    return (
        <div>
            <h3>Attendance</h3>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <form onSubmit={markManual} style={{ border: '1px solid #444', padding: '1rem' }}>
                    <h4>Manual Mark</h4>
                    <input type="number" placeholder="User ID" value={manual.user_id} onChange={e => setManual({ ...manual, user_id: e.target.value })} required />
                    <select value={manual.status} onChange={e => setManual({ ...manual, status: e.target.value })}>
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Late</option>
                    </select>
                    <button type="submit">Mark</button>
                </form>

                <form onSubmit={markBarcode} style={{ border: '1px solid #444', padding: '1rem' }}>
                    <h4>Barcode Scanner</h4>
                    <input placeholder="Scan Barcode (User ID)" value={barcode} onChange={e => setBarcode(e.target.value)} autoFocus />
                    <button type="submit">Simulate Scan</button>
                </form>
            </div>

            <h4>Records</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {attendance.map(a => (
                    <div key={a.id}>ID: {a.user_id} | {a.status} | {new Date(a.date).toLocaleString()} | By: {a.marked_by}</div>
                ))}
            </div>
        </div>
    )
}

const MessageManager = ({ token }) => {
    const [replies, setReplies] = useState([])
    const [msg, setMsg] = useState({ receiver_username: '', message: '', type: 'normal' })

    const fetchReplies = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/message/replies`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setReplies(res.data)
        } catch (e) { }
    }

    useEffect(() => { fetchReplies() }, [])

    const sendMsg = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/message/send`, msg, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Message Sent')
            setMsg({ ...msg, message: '' })
        } catch (e) { alert('Error sending message') }
    }

    return (
        <div>
            <h3>Messaging</h3>
            <form onSubmit={sendMsg} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input placeholder="To Username" value={msg.receiver_username} onChange={e => setMsg({ ...msg, receiver_username: e.target.value })} required />
                <input placeholder="Message" value={msg.message} onChange={e => setMsg({ ...msg, message: e.target.value })} required />
                <select value={msg.type} onChange={e => setMsg({ ...msg, type: e.target.value })}>
                    <option value="normal">Normal</option>
                    <option value="warning">Warning</option>
                </select>
                <button type="submit">Send</button>
            </form>

            <h4>Inbox (Replies)</h4>
            <ul>
                {replies.map(r => (
                    <li key={r.id}>
                        From User {r.sender_id}: {r.message} ({new Date(r.timestamp).toLocaleString()})
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default OwnerDashboard
