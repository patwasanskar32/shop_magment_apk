import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
    {
        id: 'attendance',
        icon: '📅',
        color: '#667eea',
        gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
        title: 'Attendance',
        tagline: 'Smart attendance tracking made effortless',
        description: 'Track employee attendance in real-time with QR code scanning and barcode support. Monitor check-ins, check-outs, late arrivals, and absences automatically — all from one beautiful dashboard.',
        highlights: ['✅ QR & Barcode check-in', '✅ Late arrival detection', '✅ Daily/monthly reports', '✅ Export to Excel'],
        screenshot: '📊',
    },
    {
        id: 'hr',
        icon: '💰',
        color: '#f093fb',
        gradient: 'linear-gradient(135deg,#f093fb,#f5576c)',
        title: 'HR & Payroll',
        tagline: 'Payroll automation that saves hours every month',
        description: 'Set salaries, manage leave requests, and auto-generate payslips based on attendance data. Calculate deductions for absences and late arrivals automatically.',
        highlights: ['✅ Auto payslip generation', '✅ Leave approval workflow', '✅ Salary management', '✅ Deduction calculation'],
        screenshot: '💼',
    },
    {
        id: 'pos',
        icon: '🛍️',
        color: '#4facfe',
        gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)',
        title: 'Point of Sale',
        tagline: 'Sell products with a lightning-fast POS',
        description: 'Add products, manage your catalog, and process sales with a beautiful POS interface. Track stock, handle payments (cash/card/UPI), and view complete sales history.',
        highlights: ['✅ Product catalog', '✅ Cart & checkout', '✅ Stock tracking', '✅ Sales history'],
        screenshot: '🏪',
    },
    {
        id: 'analytics',
        icon: '📊',
        color: '#43e97b',
        gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)',
        title: 'Analytics',
        tagline: 'Data-driven insights at a glance',
        description: 'Visual charts and KPI dashboards give you instant insights into attendance trends, sales performance, payroll summaries, and top-selling products.',
        highlights: ['✅ Interactive charts', '✅ KPI cards', '✅ Sales analytics', '✅ Staff performance'],
        screenshot: '📈',
    },
    {
        id: 'staff',
        icon: '👥',
        color: '#fa709a',
        gradient: 'linear-gradient(135deg,#fa709a,#fee140)',
        title: 'Staff Management',
        tagline: 'Manage your whole team from one place',
        description: 'Add staff members, set their roles, generate QR codes and barcodes for attendance, and view their complete profile including attendance history.',
        highlights: ['✅ Add/remove staff', '✅ QR code generation', '✅ Role-based access', '✅ Attendance history'],
        screenshot: '🧑‍💼',
    },
    {
        id: 'messages',
        icon: '💬',
        color: '#a18cd1',
        gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
        title: 'Messages',
        tagline: 'Stay connected with your team instantly',
        description: 'Send announcements, notices, and messages to all staff directly from the dashboard. Keep everyone up to date without needing external apps.',
        highlights: ['✅ Send announcements', '✅ Broadcasts to all staff', '✅ Message history', '✅ Real-time notifications'],
        screenshot: '📣',
    },
]

export default function LandingPage() {
    const [selected, setSelected] = useState(null)
    const navigate = useNavigate()

    const handleFeatureClick = (feature) => {
        setSelected(selected?.id === feature.id ? null : feature)
        setTimeout(() => {
            document.getElementById('feature-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', color: 'white', fontFamily: "'Inter','Segoe UI',sans-serif", overflowX: 'hidden' }}>

            {/* NAV */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,20,0.85)' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🏢 ShopERP</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/login')} style={{ padding: '0.5rem 1.2rem', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Sign In</button>
                    <button onClick={() => navigate('/register')} style={{ padding: '0.5rem 1.4rem', borderRadius: 8, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Start Free →</button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse,rgba(102,126,234,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'inline-block', padding: '0.3rem 1rem', background: 'rgba(102,126,234,0.15)', borderRadius: 20, border: '1px solid rgba(102,126,234,0.3)', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1.5rem', fontWeight: 600 }}>🚀 All-in-One Shop Management</div>
                <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
                    Simple, efficient,<br />
                    <span style={{ background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>yet powerful!</span>
                </h1>
                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                    One platform to manage your shop — attendance, HR, payroll, POS, and analytics. Built for Indian businesses.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/register')} style={{ padding: '0.85rem 2.2rem', borderRadius: 12, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 25px rgba(102,126,234,0.35)', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.target.style.transform = 'translateY(0)'}>Start now — It's free</button>
                    <button onClick={() => navigate('/login')} style={{ padding: '0.85rem 2.2rem', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>Sign in →</button>
                </div>
                <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>No credit card required · Free forever for small teams</p>
            </section>

            {/* FEATURE GRID */}
            <section style={{ padding: '1rem 2rem 3rem', maxWidth: 900, margin: '0 auto' }}>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: 1 }}>CLICK A MODULE TO LEARN MORE</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '1rem' }}>
                    {FEATURES.map(f => (
                        <div key={f.id} onClick={() => handleFeatureClick(f)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                                padding: '1.4rem 0.8rem', borderRadius: 16, cursor: 'pointer', transition: 'all 0.25s',
                                background: selected?.id === f.id ? `linear-gradient(135deg,rgba(102,126,234,0.2),rgba(118,75,162,0.2))` : 'rgba(255,255,255,0.04)',
                                border: selected?.id === f.id ? '1px solid rgba(102,126,234,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                transform: selected?.id === f.id ? 'translateY(-4px)' : 'none',
                                boxShadow: selected?.id === f.id ? '0 8px 30px rgba(102,126,234,0.2)' : 'none',
                            }}
                            onMouseOver={e => { if (selected?.id !== f.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                            onMouseOut={e => { if (selected?.id !== f.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        >
                            <div style={{ width: 58, height: 58, borderRadius: 14, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', boxShadow: `0 4px 15px ${f.color}40` }}>
                                {f.icon}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selected?.id === f.id ? 'white' : 'rgba(255,255,255,0.7)', textAlign: 'center' }}>{f.title}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURE DETAIL */}
            {selected && (
                <section id="feature-detail" style={{ maxWidth: 860, margin: '0 auto 4rem', padding: '0 2rem', animation: 'fadeIn 0.4s ease' }}>
                    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
                    <div style={{ borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: `1px solid ${selected.color}40`, overflow: 'hidden', boxShadow: `0 20px 60px ${selected.color}20` }}>
                        {/* header bar */}
                        <div style={{ background: selected.gradient, padding: '2.5rem 2.5rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{selected.screenshot}</div>
                            <h2 style={{ margin: '0 0 0.4rem', fontSize: '2rem', fontWeight: 900 }}>{selected.title} <span style={{ fontWeight: 400, opacity: 0.85 }}>made effortless</span></h2>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>{selected.tagline}</p>
                        </div>
                        {/* body */}
                        <div style={{ padding: '2rem 2.5rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{selected.description}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.6rem' }}>
                                {selected.highlights.map(h => (
                                    <div key={h} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.5rem 0.8rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>{h}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* STATS STRIP */}
            <section style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '2.5rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' }}>
                    {[['6+', 'Modules'], ['100%', 'Free to start'], ['INR', 'Local currency'], ['Cloud', 'Always synced']].map(([val, label]) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* REGISTRATION CTA */}
            <section style={{ textAlign: 'center', padding: '5rem 2rem 6rem' }}>
                <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, margin: '0 0 1rem' }}>
                    Ready to manage your shop<br />
                    <span style={{ background: 'linear-gradient(135deg,#667eea,#f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the smart way?</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', marginBottom: '2.5rem', maxWidth: 420, margin: '0 auto 2.5rem' }}>
                    Create your free account in 30 seconds. No credit card required.
                </p>
                <button onClick={() => navigate('/register')}
                    style={{ padding: '1rem 3rem', borderRadius: 14, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 35px rgba(102,126,234,0.4)', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.target.style.transform = 'translateY(-3px) scale(1.02)'}
                    onMouseOut={e => e.target.style.transform = 'translateY(0) scale(1)'}>
                    🚀 Create Free Account
                </button>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginTop: '1rem' }}>Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span></p>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
                © 2025 ShopERP · Built for Indian Businesses 🇮🇳
            </footer>
        </div>
    )
}
