import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#667eea', '#f093fb', '#22c55e', '#f59e0b', '#ef4444']

const KpiCard = ({ label, value, sub, color }) => (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem 1.5rem', border: `1px solid ${color}30`, flex: 1, minWidth: 140 }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>{label}</p>
        <p style={{ color, fontWeight: 700, fontSize: '1.8rem', margin: '0 0 0.25rem 0' }}>{value}</p>
        {sub && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: 0 }}>{sub}</p>}
    </div>
)

export default function AnalyticsManager({ token }) {
    const [overview, setOverview] = useState(null)
    const [attStats, setAttStats] = useState(null)
    const [dailyAtt, setDailyAtt] = useState([])
    const [dailySales, setDailySales] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [staffPerf, setStaffPerf] = useState([])
    const [payroll, setPayroll] = useState(null)
    const [loading, setLoading] = useState(true)

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [ov, att, dAtt, dSales, top, perf, pay] = await Promise.all([
                axios.get(`${API_BASE_URL}/analytics/overview`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/attendance`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/attendance/daily?days=14`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/sales/daily?days=14`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/top-products`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/staff-performance`, { headers }),
                axios.get(`${API_BASE_URL}/analytics/payroll-summary`, { headers }),
            ])
            setOverview(ov.data); setAttStats(att.data); setDailyAtt(dAtt.data)
            setDailySales(dSales.data); setTopProducts(top.data)
            setStaffPerf(perf.data); setPayroll(pay.data)
        } catch (e) { console.log('Analytics error', e) }
        setLoading(false)
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>Loading analytics...</div>

    const attPieData = attStats ? [
        { name: 'Present', value: attStats.present },
        { name: 'Late', value: attStats.late },
        { name: 'Absent', value: attStats.absent },
    ].filter(d => d.value > 0) : []

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', margin: 0 }}>📊 Analytics Dashboard</h3>
                <button onClick={fetchAll} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem' }}>↻ Refresh</button>
            </div>

            {/* KPI Cards */}
            {overview && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <KpiCard label="Total Staff" value={overview.total_staff} sub="in your org" color="#667eea" />
                    <KpiCard label="Present Today" value={overview.present_today} sub={`of ${overview.total_staff}`} color="#22c55e" />
                    <KpiCard label="Monthly Revenue" value={`₹${overview.monthly_revenue.toLocaleString()}`} sub="this month" color="#f093fb" />
                    <KpiCard label="Sales Today" value={overview.total_sales_today} sub="transactions" color="#f59e0b" />
                    <KpiCard label="Low Stock" value={overview.low_stock_alerts} sub="products" color={overview.low_stock_alerts > 0 ? '#ef4444' : '#22c55e'} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Attendance Chart */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>Daily Attendance (Last 14 Days)</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={dailyAtt}>
                            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                            <Bar dataKey="present" fill="#667eea" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales Chart */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>Daily Revenue (Last 14 Days)</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={dailySales}>
                            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} formatter={(v) => [`₹${v}`, 'Revenue']} />
                            <Line type="monotone" dataKey="revenue" stroke="#f093fb" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Attendance Pie */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>This Month Attendance</p>
                    {attPieData.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '3rem 0' }}>No data yet</p> : (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={attPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {attPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Products */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>Top Products</p>
                    {topProducts.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem 0' }}>No sales yet</p> :
                        topProducts.map((p, i) => (
                            <div key={p.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{i + 1}</span>
                                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{p.name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: '#f093fb', fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>₹{p.total_revenue}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.75rem' }}>{p.total_qty} sold</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Staff Performance */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>Staff Performance This Month</p>
                {staffPerf.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>No staff data</p> :
                    staffPerf.map(s => (
                        <div key={s.staff_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'white', minWidth: 100, fontSize: '0.9rem' }}>{s.username}</span>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                                <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 20, transition: 'width 0.5s' }} />
                            </div>
                            <span style={{ color: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 700, minWidth: 45, fontSize: '0.85rem' }}>{s.score}%</span>
                        </div>
                    ))}
            </div>

            {/* Payroll Summary */}
            {payroll && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>PAYROLL STAFF</p><p style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>{payroll.staff_count}</p></div>
                    <div><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>TOTAL PAYROLL</p><p style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>₹{payroll.total_payroll.toLocaleString()}</p></div>
                    <div><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>DEDUCTIONS</p><p style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>₹{payroll.total_deductions.toLocaleString()}</p></div>
                </div>
            )}
        </div>
    )
}
