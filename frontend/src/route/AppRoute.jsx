import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../screen/Home.jsx'
import Login from '../screen/login.jsx'
import Register from '../screen/register.jsx'
import UserAuth from '../auth/UserAuth.jsx'
import Editor from '../screen/Editor.jsx'
import About from '../screen/About.jsx'

const AppRoute = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserAuth><Home /></UserAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/editor" element={<UserAuth><Editor /></UserAuth>} />
                <Route path='/about' element={<UserAuth><About /></UserAuth>} />

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoute