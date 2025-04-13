import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Searching from './pages/component/Search'
import Login from './pages/Auth/LogIn'
import Signup from './pages/Auth/SignUp'
import ProtectedRoute from './pages/Auth/ProtectedRoute' 
import Marketplace from './pages/Market'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Landing/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        
        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path='/search' element={<Searching/>}/>
          {/* Add other protected routes here */}
        </Route>

         {/* Protected routes - require authentication */}
         <Route element={<ProtectedRoute />}>
          <Route path='/market' element={<Marketplace/>}/>
        </Route>
        
        {/* Fallback route for unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App