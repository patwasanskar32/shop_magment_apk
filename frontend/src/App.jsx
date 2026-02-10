import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import OwnerDashboard from './pages/OwnerDashboard'
import StaffDashboard from './pages/StaffDashboard'

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext)
    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/login" />
    if (role && user.role !== role) return <Navigate to="/" />
    return children
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/owner" element={
                    <PrivateRoute role="owner">
                        <OwnerDashboard />
                    </PrivateRoute>
                } />
                <Route path="/staff" element={
                    <PrivateRoute role="staff">
                        <StaffDashboard />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default App
