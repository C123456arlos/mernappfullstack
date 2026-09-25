import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Drive from './pages/drive'

const App = () => {
  return (
    <>
      <Toaster></Toaster>
      <Routes>
        <Route path='/login' element={<Login mode='login'></Login>}></Route>
        <Route path='/register' element={<Login mode='register'></Login>}></Route>
        <Route path='/' element={<Drive></Drive>}></Route>
        <Route path='*' element={<Navigate to='/' replace></Navigate>}></Route>
      </Routes>
    </>
  )
}

export default App