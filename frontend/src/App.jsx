import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import Searching from './pages/component/Search'
import Login from './pages/Auth/LogIn'
import Signup from './pages/Auth/SignUp'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      {/* Main route */}
      <Route path='/' element={<Landing/>}/>
      <Route path='/search' element={<Searching/>}/>

      {/* User Auth */}
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
 
    </Routes>
   </BrowserRouter>
  )
}

export default App
