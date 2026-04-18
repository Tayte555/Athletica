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
import Discover from "./pages/discover/DiscoverPage";
import CreateRoutine from "./pages/routines/RoutineCreatePage";
import EditRoutine from "./pages/routines/RoutineEditPage";
import RoutineList from "./pages/routines/lists/RoutinePage";
import MyRoutines from "./pages/routines/lists/RoutineMyPage";
import RoutineDetails from "./pages/routines/RoutineDetailsPage";
import SavedRoutines from "./pages/routines/lists/RoutineSavedPage";
import AdminSettings from "./pages/settings/subpages/AdminSettings";

export default function App() {
  return (
    <Routes>
      {/**PUBLIC General Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/:username" element={<Profile />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/routines/:id" element={<RoutineDetails />} />

      {/**PRIVATE General Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines"
        element={
          <ProtectedRoute>
            <RoutineList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines/create"
        element={
          <ProtectedRoute>
            <CreateRoutine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines/:id/edit"
        element={
          <ProtectedRoute>
            <EditRoutine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines/my-routines"
        element={
          <ProtectedRoute>
            <MyRoutines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines/saved"
        element={
          <ProtectedRoute>
            <SavedRoutines />
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
        <Route path="admin" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
