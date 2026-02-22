import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const s = {
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 },
    input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' },
    btn: { padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
    badge: (color) => ({ padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: color === 'pending' ? 'rgba(245,158,11,0.2)' : color === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: color === 'pending' ? '#f59e0b' : color === 'approved' ? '#22c55e' : '#ef4444' }),
}

export default function HRManager({ token }) {
    const [hrTab, setHrTab] = useState('salary')
    const [staff, setStaff] = useState([])
    const [salaries, setSalaries] = useState([])
    const [leaves, setLeaves] = useState([])
    const [payslips, setPayslips] = useState([])
    const [salaryForm, setSalaryForm] = useState({ user_id: '', base_salary: '', currency: 'INR' })
    const [genForm, setGenForm] = useState({ user_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })
    const [msg, setMsg] = useState('')

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            const [staffRes, salRes, leaveRes, slipRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/staff/all`, { headers }),
                axios.get(`${API_BASE_URL}/hr/salary/all`, { headers }),
                axios.get(`${API_BASE_URL}/hr/leave/all`, { headers }),
                axios.get(`${API_BASE_URL}/hr/payslip/all`, { headers }),
            ])
            setStaff(staffRes.data)
            setSalaries(salRes.data)
            setLeaves(leaveRes.data)
            setPayslips(slipRes.data)
        } catch (e) { console.log('HR fetch error', e) }
    }

    const setSalary = async () => {
        try {
            await axios.post(`${API_BASE_URL}/hr/salary/set`, { user_id: parseInt(salaryForm.user_id), base_salary: parseFloat(salaryForm.base_salary), currency: salaryForm.currency }, { headers })
            setMsg('✅ Salary set!'); fetchAll()
        } catch (e) { setMsg('❌ ' + (e.response?.data?.detail || 'Error')) }
    }

    const reviewLeave = async (id, status) => {
        try {
            await axios.patch(`${API_BASE_URL}/hr/leave/${id}/review`, { status }, { headers })
            fetchAll()
        } catch (e) { alert('Error reviewing leave') }
    }

    const generatePayslip = async () => {
        try {
            await axios.post(`${API_BASE_URL}/hr/payslip/generate?user_id=${genForm.user_id}&month=${genForm.month}&year=${genForm.year}`, {}, { headers })
            setMsg('✅ Payslip generated!'); fetchAll()
        } catch (e) { setMsg('❌ ' + (e.response?.data?.detail || 'Error')) }
    }

    const staffName = (id) => staff.find(s => s.id === id)?.username || `Staff #${id}`

    const tabStyle = (t) => ({
        ...s.btn,
        background: hrTab === t ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.07)',
        color: 'white'
    })

    return (
        <div>
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>👥 HR & Payroll</h3>
            {msg && <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: msg.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.startsWith('✅') ? '#22c55e' : '#ef4444', marginBottom: '1rem' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['salary', 'leaves', 'payslips'].map(t => (
                    <button key={t} style={tabStyle(t)} onClick={() => setHrTab(t)}>
                        {t === 'salary' ? '💰 Salary' : t === 'leaves' ? '🏖️ Leaves' : '📄 Payslips'}
                    </button>
                ))}
            </div>

            {/* SALARY TAB */}
            {hrTab === 'salary' && (
                <div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Set Staff Salary</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                            <div>
                                <p style={s.label}>Staff</p>
                                <select style={s.input} value={salaryForm.user_id} onChange={e => setSalaryForm({ ...salaryForm, user_id: e.target.value })}>
                                    <option value="">Select staff</option>
                                    {staff.filter(s => s.role === 'staff').map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                                </select>
                            </div>
                            <div>
                                <p style={s.label}>Monthly Salary</p>
                                <input style={s.input} type="number" placeholder="e.g. 15000" value={salaryForm.base_salary} onChange={e => setSalaryForm({ ...salaryForm, base_salary: e.target.value })} />
                            </div>
                            <div>
                                <p style={s.label}>Currency</p>
                                <select style={s.input} value={salaryForm.currency} onChange={e => setSalaryForm({ ...salaryForm, currency: e.target.value })}>
                                    <option>INR</option><option>USD</option><option>EUR</option>
                                </select>
                            </div>
                            <button style={{ ...s.btn, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }} onClick={setSalary}>Set</button>
                        </div>
                    </div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Current Salaries</p>
                        {salaries.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>No salaries set yet</p> :
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr>{['Staff', 'Salary', 'Currency', 'Since'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>)}</tr></thead>
                                <tbody>{salaries.map(sal => (
                                    <tr key={sal.id}>
                                        <td style={{ padding: '0.5rem', color: 'white' }}>{staffName(sal.user_id)}</td>
                                        <td style={{ padding: '0.5rem', color: '#22c55e', fontWeight: 700 }}>₹{sal.base_salary.toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>{sal.currency}</td>
                                        <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{new Date(sal.effective_from).toLocaleDateString()}</td>
                                    </tr>
                                ))}</tbody>
                            </table>}
                    </div>
                </div>
            )}

            {/* LEAVES TAB */}
            {hrTab === 'leaves' && (
                <div style={s.card}>
                    <p style={{ ...s.label, marginBottom: '1rem' }}>Leave Requests ({leaves.length})</p>
                    {leaves.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>No leave requests</p> :
                        leaves.map(lv => (
                            <div key={lv.id} style={{ padding: '1rem', borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{staffName(lv.user_id)} — <span style={{ color: '#a78bfa' }}>{lv.leave_type}</span></p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '0.25rem 0' }}>{new Date(lv.start_date).toLocaleDateString()} → {new Date(lv.end_date).toLocaleDateString()}</p>
                                    {lv.reason && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>"{lv.reason}"</p>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={s.badge(lv.status)}>{lv.status}</span>
                                    {lv.status === 'pending' && <>
                                        <button style={{ ...s.btn, background: 'rgba(34,197,94,0.2)', color: '#22c55e' }} onClick={() => reviewLeave(lv.id, 'approved')}>✓ Approve</button>
                                        <button style={{ ...s.btn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => reviewLeave(lv.id, 'rejected')}>✗ Reject</button>
                                    </>}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* PAYSLIPS TAB */}
            {hrTab === 'payslips' && (
                <div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Generate Payslip</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                            <div>
                                <p style={s.label}>Staff</p>
                                <select style={s.input} value={genForm.user_id} onChange={e => setGenForm({ ...genForm, user_id: e.target.value })}>
                                    <option value="">Select</option>
                                    {staff.filter(s => s.role === 'staff').map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                                </select>
                            </div>
                            <div>
                                <p style={s.label}>Month</p>
                                <select style={s.input} value={genForm.month} onChange={e => setGenForm({ ...genForm, month: e.target.value })}>
                                    {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <p style={s.label}>Year</p>
                                <input style={s.input} type="number" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: e.target.value })} />
                            </div>
                            <button style={{ ...s.btn, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }} onClick={generatePayslip}>Generate</button>
                        </div>
                    </div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Generated Payslips</p>
                        {payslips.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>No payslips yet</p> :
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr>{['Staff', 'Month', 'Days Present', 'Deductions', 'Net Pay'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>)}</tr></thead>
                                <tbody>{payslips.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ padding: '0.5rem', color: 'white' }}>{staffName(p.user_id)}</td>
                                        <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>{MONTH_NAMES[p.month - 1]} {p.year}</td>
                                        <td style={{ padding: '0.5rem', color: '#60a5fa' }}>{p.days_present} / {p.days_present + p.days_absent + p.days_late}</td>
                                        <td style={{ padding: '0.5rem', color: '#ef4444' }}>-₹{p.deductions.toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem', color: '#22c55e', fontWeight: 700 }}>₹{p.net_salary.toLocaleString()}</td>
                                    </tr>
                                ))}</tbody>
                            </table>}
                    </div>
                </div>
            )}
        </div>
    )
}
