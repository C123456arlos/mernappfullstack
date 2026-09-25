import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const DashboardLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isCreateFolderOpen, setIsCreateFolderOpen]= useState(false)
  return (
      <div className='min-h-screen bg-slate-50 text-slate-900 flex flex-col'>
          <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen}
              onCreateFolderClick={() => setIsCreateFolderOpen(true)}></Sidebar>
          <div className='md:pl-64 flex flex-col flex-1'>
              <Header onMobileMenuToggle={()=>setIsMobileOpen(!isMobileOpen)}></Header>
              <main className='flex-1 p-4 md:p-6 overflow-y-auto'>
                  <Outlet></Outlet>
              </main>
          </div>
    </div>
  )
}

export default DashboardLayout