import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const role = localStorage.getItem('role')
        const username = localStorage.getItem('username')
        if (token) {
            setUser({ token, role, username })
        }
        setLoading(false)
    }, [])

    const login = (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('role', userData.role)
        localStorage.setItem('username', userData.username) // Assuming sub is username
        setUser({ token, ...userData })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('username')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
