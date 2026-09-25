import React from 'react'
import { useApp } from '../../context/AppContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../ui/Spinner'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useApp()
    const location = useLocation()
    if (isLoading) {
        return (
            <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3'>
                <Spinner size='lg' className='text-orange-600'></Spinner>
                <p className='text-sm text-slate-500 font-medium'>loading drive</p>
            </div>
        )
    }
    if (!isAuthenticated) {
        return <Navigate to='/login' state={{from:location}} replace></Navigate>
    }
    return children ? <>{children}</>:<Outlet></Outlet>
}

export default ProtectedRoute