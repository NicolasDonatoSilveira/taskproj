import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Task_Boards from './pages/Task_Boards'
import Login from './pages/Login/login'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="task_boards" element={<Task_Boards />}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App