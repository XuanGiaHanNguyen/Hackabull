import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import Auth from './pages/Auth'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/auth' element={<Auth/>}/>
    </Routes>
   </BrowserRouter>
  )
}

export default App
