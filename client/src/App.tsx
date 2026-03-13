import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/landing/LandingPage";
import Register from "./pages/registration/RegistrationPage";
import Login from "./pages/login/LoginPage";
import Dashboard from "./pages/dashboard/DashboardPage";
import Profile from "./pages/profile/ProfilePage";
import Settings from "./pages/settings/SettingsPage";
import ProfileSettings from "./pages/settings/subpages/ProfileSettings";
import AccountSettings from "./pages/settings/subpages/AccountSettings";
import NotificationSettings from "./pages/settings/subpages/NotificationsSettings";
import SecuritySettings from "./pages/settings/subpages/SecuritySettings";

export default function App() {
  return (
    <Routes>
      {/**PUBLIC General Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/:username" element={<Profile />} />

      {/**PRIVATE General Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/**PRIVATE Settings Routes */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
      </Route>
    </Routes>
  );
}
