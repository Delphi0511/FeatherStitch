import Signup from "./components/Signup";

import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TailorDashboard from "./components/TailorDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerProfile from './components/CustomerProfile';
import TailorProfile from './components/TailorProfile';
import BodyMeasurements from './components/BodyMeasurements';
import ProtectedRoute, { GuestOnlyRoute } from "./components/ProtectedRoute";
import Landing from './components/Landing';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import MyPosts from './components/MyPosts';
import PostEditorPage from './components/PostEditorPage';
import TailorGallery from './components/TailorGallery';
import FindTailor from './components/FindTailor';
import TailorPublicPage from './components/TailorPublicPage';
import CustomerGallery from './components/CustomerGallery';
import NotFound from './components/NotFound';
import OrderDesignPage from './components/OrderDesignPage';
import CustomerOrders from './components/CustomerOrders';
import TailorOrders from './components/TailorOrders';
import TailorCustomers from './components/TailorCustomers';

// Defines the application's public and role-protected client-side routes.
function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
    <Route path="/signup" element={<GuestOnlyRoute><Signup /></GuestOnlyRoute>} />
    <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPassword /></GuestOnlyRoute>} />
    {/* Not guest-only: a reset link must work even if another account is signed in on this browser. */}
    <Route path="/reset-password" element={<ResetPassword />} />

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
          <MyPosts />
        </ProtectedRoute>
      }
    />

    <Route
      path="/tailorgallery"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <TailorGallery />
        </ProtectedRoute>
      }
    />

    <Route
      path="/posts/new"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <PostEditorPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/posts/:id/edit"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <PostEditorPage />
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

    <Route
      path="/findtailor"
      element={
        <ProtectedRoute allowedRole="Customer">
          <FindTailor />
        </ProtectedRoute>
      }
    />

    <Route
      path="/tailors/:id"
      element={
        <ProtectedRoute allowedRole="Customer">
          <TailorPublicPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/gallery"
      element={
        <ProtectedRoute allowedRole="Customer">
          <CustomerGallery />
        </ProtectedRoute>
      }
    />

    <Route
      path="/order/:postId"
      element={
        <ProtectedRoute allowedRole="Customer">
          <OrderDesignPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/orders"
      element={
        <ProtectedRoute allowedRole="Customer">
          <CustomerOrders />
        </ProtectedRoute>
      }
    />

    <Route
      path="/tailororders"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <TailorOrders />
        </ProtectedRoute>
      }
    />

    <Route
      path="/tailorcustomers"
      element={
        <ProtectedRoute allowedRole="Tailor">
          <TailorCustomers />
        </ProtectedRoute>
      }
    />

    {/* Any other URL (e.g. features not built yet) */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
  )
}

export default App;
