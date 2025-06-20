// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CreateProfile from './components/CreateProfile';
import PricingPage from './pages/PricingPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/signup" element={<AuthForm mode="signup" />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more protected routes here */}
      </Route>
    </Routes>
  );
}
// This file defines the main application routes.
// It includes public routes for login and signup, and protected routes for the dashboard.