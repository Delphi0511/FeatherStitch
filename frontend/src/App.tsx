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
import AddEditPost from './components/AddEditPost';

function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<h1 className="text-3xl font-bold text-blue-600">Tailwind is working!</h1>} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* Tailor Routes */}
    <Route
      path="/tailordashboard"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <TailorDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/tailorprofile"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <TailorProfile />
        </ProtectedRoute>
      }
    />
    <Route
  path="/posts"
  element={
    <ProtectedRoute allowedRole="Tailor">
      <AddEditPost
        onSave={(data, status) => {
          console.log(data, status);
        }}
        onCancel={() => {
          console.log("Cancelled");
        }}
      />
    </ProtectedRoute>
  }
/>

    {/* Customer Routes */}
    <Route
      path="/customerdashboard"
      element={
        <ProtectedRoute allowedRole="Customer">
          <CustomerDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/customerprofile"
      element={
        <ProtectedRoute allowedRole="Customer">
          <CustomerProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/measurements"
      element={
        <ProtectedRoute allowedRole="Customer">
          <BodyMeasurements />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>
  )
}

export default App;


