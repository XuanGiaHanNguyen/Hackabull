import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import Searching from './pages/Search'
import Dock from './pages/Dock'
import Detail from './pages/Detail'
import Auth from './pages/Auth'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/search' element={<Searching/>}/>
      <Route path='/dashboard/:userId' element={<Dock/>}/>
      <Route path='/detail/:productId' element={<Detail/>}/>
      <Route path='/auth' element={<Auth/>}/>
    </Routes>
   </BrowserRouter>
  )
}

export default App
