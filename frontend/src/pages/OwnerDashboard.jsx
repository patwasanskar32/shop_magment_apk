import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import HRManager from '../components/HRManager'
import POSManager from '../components/POSManager'
import AnalyticsManager from '../components/AnalyticsManager'

const TABS = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'staff', label: '👥 Staff' },
    { id: 'attendance', label: '📅 Attendance' },
    { id: 'hr', label: '💰 HR & Payroll' },
    { id: 'pos', label: '🛍️ POS' },
    { id: 'messages', label: '💬 Messages' },
]

const OwnerDashboard = () => {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('analytics')

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <div style={{ textAlign: 'left', padding: '2rem', minHeight: '100vh', background: '#0f0f1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.75rem' }}>🏢 Shop ERP</h2>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Welcome, {user?.username}</p>
                </div>
                <button onClick={logout} style={{ padding: '0.5rem 1.2rem', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Logout</button>
            </header>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '0.6rem 1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                        background: activeTab === tab.id ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.07)',
                        color: 'white', boxShadow: activeTab === tab.id ? '0 4px 15px rgba(102,126,234,0.3)' : 'none'
                    }}>{tab.label}</button>
                ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                {activeTab === 'analytics' && <AnalyticsManager token={user?.token} />}
                {activeTab === 'staff' && <StaffManager token={user?.token} />}
                {activeTab === 'attendance' && <AttendanceManager token={user?.token} />}
                {activeTab === 'hr' && <HRManager token={user?.token} />}
                {activeTab === 'pos' && <POSManager token={user?.token} />}
                {activeTab === 'messages' && <MessageManager token={user?.token} />}
            </div>
        </div>
    )
}

const StaffManager = ({ token }) => {
    const [staff, setStaff] = useState([])
    const [newStaff, setNewStaff] = useState({ username: '', password: '' })
    const [resetPassword, setResetPassword] = useState({ username: '', newPassword: '' })
    const [showResetForm, setShowResetForm] = useState(false)

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

    const handleResetPassword = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                username: resetPassword.username,
                new_password: resetPassword.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert(`✅ Password reset successfully for ${resetPassword.username}!`)
            setResetPassword({ username: '', newPassword: '' })
            setShowResetForm(false)
        } catch (e) {
            alert(e.response?.data?.detail || 'Error resetting password')
        }
    }

    return (
        <div>
            <h3>Staff Management</h3>

            {/* Add Staff Form */}
            <form onSubmit={addStaff} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input placeholder="Username" value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} required />
                <input placeholder="Password" type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} required />
                <button type="submit">Add Staff</button>
            </form>

            {/* Password Reset Toggle */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => setShowResetForm(!showResetForm)}
                    style={{
                        background: showResetForm ? 'rgba(245, 87, 108, 0.2)' : 'rgba(102, 126, 234, 0.2)',
                        border: showResetForm ? '1px solid rgba(245, 87, 108, 0.4)' : '1px solid rgba(102, 126, 234, 0.4)',
                        padding: '0.5rem 1rem'
                    }}
                >
                    {showResetForm ? '✕ Cancel' : '🔐 Reset Staff Password'}
                </button>
            </div>

            {/* Password Reset Form */}
            {showResetForm && (
                <form onSubmit={handleResetPassword} style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px'
                }}>
                    <select
                        value={resetPassword.username}
                        onChange={e => setResetPassword({ ...resetPassword, username: e.target.value })}
                        required
                        style={{ flex: 1 }}
                    >
                        <option value="">-- Select Staff --</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.username}>{s.username} (ID: {s.id})</option>
                        ))}
                    </select>
                    <input
                        placeholder="New Password"
                        type="password"
                        value={resetPassword.newPassword}
                        onChange={e => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
                        required
                        style={{ flex: 1 }}
                    />
                    <button type="submit" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        Reset Password
                    </button>
                </form>
            )}

            {/* Staff List */}
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
    const [staff, setStaff] = useState([])
    const [selectedStaffId, setSelectedStaffId] = useState('')

    const fetchAttendance = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/attendance/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAttendance(res.data)
        } catch (e) { console.error(e) }
    }

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/staff/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStaff(res.data)
        } catch (e) { console.error(e) }
    }

    useEffect(() => {
        fetchAttendance()
        fetchStaff()
    }, [])

    const handleCheckIn = async () => {
        if (!selectedStaffId) {
            alert('Please select a staff member')
            return
        }
        try {
            await axios.post(`${API_BASE_URL}/attendance/check-in?user_id=${selectedStaffId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchAttendance()
            setSelectedStaffId('')
            alert('✅ Check-in successful!')
        } catch (e) {
            alert(e.response?.data?.detail || 'Error checking in')
        }
    }

    const handleCheckOut = async (attendanceId) => {
        try {
            await axios.post(`${API_BASE_URL}/attendance/check-out/${attendanceId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchAttendance()
            alert('✅ Check-out successful!')
        } catch (e) {
            alert(e.response?.data?.detail || 'Error checking out')
        }
    }

    return (
        <div>
            <h3>📋 Attendance Sheet</h3>

            {/* Check-in Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '1rem' }}>Check-In Staff</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        style={{ flex: 1 }}
                    >
                        <option value="">-- Select Staff --</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.username} (ID: {s.id})</option>
                        ))}
                    </select>
                    <button onClick={handleCheckIn} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                        ✓ Check In
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(102, 126, 234, 0.5)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Staff ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4facfe' }}>IN Time</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#f5576c' }}>OUT Time</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map(a => {
                            const staffMember = staff.find(s => s.id === a.user_id);
                            const dateObj = new Date(a.date);
                            const checkInTime = a.check_in_time ? new Date(a.check_in_time) : null;
                            const checkOutTime = a.check_out_time ? new Date(a.check_out_time) : null;

                            return (
                                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem' }}>{a.user_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{staffMember?.username || 'Unknown'}</td>
                                    <td style={{ padding: '1rem' }}>{dateObj.toLocaleDateString('en-GB')}</td>
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
                                    <td style={{ padding: '1rem' }}>
                                        {!checkOutTime ? (
                                            <button
                                                onClick={() => handleCheckOut(a.id)}
                                                style={{
                                                    width: 'auto',
                                                    padding: '0.5rem 1.25rem',
                                                    fontSize: '0.875rem',
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    boxShadow: '0 4px 10px rgba(245, 87, 108, 0.3)'
                                                }}
                                            >
                                                Check Out
                                            </button>
                                        ) : (
                                            <span style={{ color: 'rgba(160, 174, 192, 0.6)', fontSize: '0.875rem' }}>✓ Completed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {attendance.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'rgba(160, 174, 192, 0.6)', fontSize: '1rem' }}>
                        No attendance records yet. Check in your first staff member above! 👆
                    </p>
                )}
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
