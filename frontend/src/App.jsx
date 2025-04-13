import React from 'react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import EcoShoppingAssistant from './extension/Extension'
function App() {
  return (
   <MemoryRouter initialEntries={['/extension']}>
    <Routes>
      {/* Redirect root to extension */}
      <Route path='/' element={<Navigate to="/extension" replace />}/>
      <Route path='/landing' element={<Landing/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/extension' element={<EcoShoppingAssistant/>}/>
    </Routes>
   </MemoryRouter>
  )
}
export default App