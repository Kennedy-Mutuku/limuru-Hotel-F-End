import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ResortsPage from './pages/ResortsPage';
import ServicesPage from './pages/ServicesPage';
import OffersPage from './pages/OffersPage';
import FeedbackContact from './pages/FeedbackContact';
import TendersPage from './pages/TendersPage';

// Resort detail pages
import ResortDetail, { ResortOverview, ResortRooms, ResortConference, ResortGallery, ResortVirtualTour, ResortExcursions, ResortOffers, ResortFeedback } from './pages/ResortDetail';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminTenders from './pages/admin/AdminTenders';
import AdminBids from './pages/admin/AdminBids';
import AdminRecruitment from './pages/admin/AdminRecruitment';
import AdminApplications from './pages/admin/AdminApplications';
import AdminOffers from './pages/admin/AdminOffers';
import AdminUsers from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminBranchManagers from './pages/admin/AdminBranchManagers';
import VersionSentinel from './components/common/VersionSentinel';

export default function App() {
  return (
    <AuthProvider>
      <VersionSentinel />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/resorts" element={<ResortsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/feedback" element={<FeedbackContact />} />
            <Route path="/contact" element={<FeedbackContact />} />
            <Route path="/tenders" element={<TendersPage />} />

            {/* Resort Detail Routes (All route to the scrollable ResortDetail page) */}
            <Route path="/resorts/:resort" element={<ResortDetail />} />
            <Route path="/resorts/:resort/rooms" element={<ResortDetail />} />
            <Route path="/resorts/:resort/conference" element={<ResortDetail />} />
            <Route path="/resorts/:resort/gallery" element={<ResortDetail />} />
            <Route path="/resorts/:resort/virtual-tour" element={<ResortDetail />} />
            <Route path="/resorts/:resort/excursions" element={<ResortDetail />} />
            <Route path="/resorts/:resort/offers" element={<ResortDetail />} />
            <Route path="/resorts/:resort/feedback" element={<ResortDetail />} />
          </Route>

          {/* Admin Login (no layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="tenders" element={<AdminTenders />} />
            <Route path="tenders/bidders" element={<AdminBids />} />
            <Route path="recruitments" element={<AdminRecruitment />} />
            <Route path="recruitments/applications" element={<AdminApplications />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="branch-managers" element={<AdminBranchManagers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Global Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
