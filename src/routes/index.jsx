import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ProfileSetup from "../pages/ProfileSetup.jsx";
import ProfileEdit from "../pages/ProfileEdit.jsx";
import ClientPostProject from "../pages/client/ClientPostProject.jsx";
import ClientTrackProjects from "../pages/client/ClientTrackProjects.jsx";
import ClientProjectDetail from "../pages/client/ClientProjectDetail.jsx";
import JobsPage from "../pages/JobsPage.jsx";
import ContractsPage from "../pages/ContractsPage.jsx";
import HistoryPage from "../pages/HistoryPage.jsx";
import FreelancerBidsPage from "../pages/freelancer/FreelancerBidsPage.jsx";
import FreelancerPublicProfile from "../pages/FreelancerPublicProfile.jsx";
import MessagesPage from "../pages/MessagesPage.jsx";
import TasksPage from "../pages/TasksPage.jsx";
import CoinsPage from "../pages/CoinsPage.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminCoins from "../pages/admin/AdminCoins.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Backwards compatible route */}
      <Route
        path="/profile/setup"
        element={<Navigate to="/dashboard/onboarding" replace />}
      />

      <Route path="/dashboard" element={<AuthLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfileEdit />} />
        <Route path="onboarding" element={<ProfileSetup />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="freelancers/:userId" element={<FreelancerPublicProfile />} />
        <Route path="client/post-project" element={<ClientPostProject />} />
        <Route path="client/projects" element={<ClientTrackProjects />} />
        <Route path="client/projects/:jobId/edit" element={<ClientPostProject />} />
        <Route path="client/projects/:jobId" element={<ClientProjectDetail />} />
        <Route path="bids" element={<FreelancerBidsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:userId" element={<MessagesPage />} />
        <Route path="coins" element={<CoinsPage />} />
        <Route index element={<AdminDashboard />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/coins" element={<AdminCoins />} />
      </Route>


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

