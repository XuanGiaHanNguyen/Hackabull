import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import Log_in from './pages/Log_in'
import Sign_up from './pages/Sign_up'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/login' element={<Log_in/>}/>
      <Route path='/signup' element={<Sign_up/>}/>
    </Routes>
   </BrowserRouter>
  )
}

export default App
