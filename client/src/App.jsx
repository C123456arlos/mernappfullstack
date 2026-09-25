import React from 'react'
<<<<<<< Updated upstream

const App = () => {
  return (
    <div>App</div>
=======
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Drive from './pages/drive'
import ProtectedRoute from './components/auth/protectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import SharedFile from './pages/SharedFile'
import Trash from './pages/Trash'
import SharedWithMe from './pages/SharedWithMe'

const App = () => {
  return (
    <>
      <Toaster></Toaster>
      <Routes>
        <Route path='/login' element={<Login mode='login'></Login>}></Route>
        <Route path='/register' element={<Login mode='register'></Login>}></Route>
        <Route path='/s/:token' element={<SharedWithMe></SharedWithMe>}></Route>
        <Route element={<ProtectedRoute></ProtectedRoute>}>
          <Route element={<DashboardLayout></DashboardLayout>}>
<Route path='/' element={<Drive></Drive>}></Route>
<Route path='/drive/:folderId' element={<Drive></Drive>}></Route>
<Route path='/shared' element={<SharedFile></SharedFile>}></Route>
<Route path='/trash' element={<Trash></Trash>}></Route>
          </Route>
        </Route>
        <Route path='*' element={<Navigate to='/' replace></Navigate>}></Route>
      </Routes>
    </>
>>>>>>> Stashed changes
  )
}

export default App