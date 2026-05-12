import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ProfileSetup from "../pages/ProfileSetup.jsx";
import ProfileEdit from "../pages/ProfileEdit.jsx";
import ClientPostProject from "../pages/client/ClientPostProject.jsx";
import ClientTrackProjects from "../pages/client/ClientTrackProjects.jsx";
import ClientProjectDetail from "../pages/client/ClientProjectDetail.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c]">
        {title}
      </p>
      <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Coming soon.
      </p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Backwards compatible route */}
      <Route
        path="/profile/setup"
        element={<Navigate to="/dashboard/onboarding" replace />}
      />

      <Route path="/dashboard" element={<AuthLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfileEdit />} />
        <Route path="onboarding" element={<ProfileSetup />} />
        <Route path="jobs" element={<Placeholder title="Jobs" />} />
        <Route path="client/post-project" element={<ClientPostProject />} />
        <Route path="client/projects" element={<ClientTrackProjects />} />
        <Route path="client/projects/:jobId" element={<ClientProjectDetail />} />
        <Route path="bids" element={<Placeholder title="Bids" />} />
        <Route path="contracts" element={<Placeholder title="Contracts" />} />
        <Route path="history" element={<Placeholder title="History" />} />
        <Route path="messages" element={<Placeholder title="Messages" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

