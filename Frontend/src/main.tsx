// import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
// import ProtectedRoute from "./ProtectedRoutes.tsx";
// import { Home } from "@/components/pages/Home";
// import { About } from "@/components/pages/About";
// import { Contact } from "@/components/pages/Contact";
// import { Login } from "@/components/pages/Login";
// import { Register } from "@/components/pages/Register";
// import { VerifyOTP } from "@/components/pages/VerifyOTP";
import { EmailSender } from "@/components/tools/EmailSender";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, /*Navigate, Outlet*/ } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster";

// const value = localStorage.getItem('token');

const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" index element={<EmailSender />} />

    // <Route element={<App />}>
    //   {/* Public Routes */}
    //   <Route path="/" element={<Home />} />
    //   <Route path="/about" element={<About />} />
    //   <Route path="/contact" element={<Contact />} />

    //   {/* Auth Routes */}
    //   <Route path="/auth" element={value ? <Navigate to="/dashboard" replace /> : <Outlet />}>
    //     <Route path="register" element={<Register />} />
    //     <Route path="verify-otp" element={<VerifyOTP />} />
    //     <Route path="login" element={<Login />} />
    //   </Route>

    //   {/* Protected Routes */}
    //   <Route path="/dashboard" element={<ProtectedRoute />}>
    //     {/* Add protected routes here */}
    //   </Route>

    //   {/* 404 Page */}
    //   <Route path="*" element={"404 page"} />
    // </Route>

    
  )
)

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
<StrictMode>
  <RouterProvider router={router} />
  <Toaster />
</StrictMode>,
)