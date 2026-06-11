import { useState } from 'react'
import Signup from "./components/Signup";

import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TailorDashboard from "./components/TailorDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerProfile from './components/CustomerProfile';
import TailorProfile from './components/TailorProfile';
import BodyMeasurements from './components/BodyMeasurements';
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1 className="text-3xl font-bold text-blue-600">Tailwind is working!</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tailordashboard" element={<TailorDashboard />} />
        <Route
          path="/customerdashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/customerprofile" element={<CustomerProfile />} />
        <Route path="/tailorprofile" element={<TailorProfile />} />
        <Route path="/measurements" element={<BodyMeasurements />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App;


