// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; 

// mail
import Inbox from './pages/admin/Inbox';

// Layouts
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import PublicHome from './pages/PublicHome';
import DynamicPage from './pages/DynamicPage';
import RedirectToJobs from './pages/RedirectToJobs';
import Login from './pages/Login'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import BoardMembers from './pages/admin/BoardMembers';
import BoardMemberForm from './pages/admin/BoardMemberForm'; // 👈 استيراد مكون النموذج
import CircularsManagement from './pages/admin/CircularsManagement';
import CircularForm from './pages/admin/CircularForm'; // 👈 استيراد نموذج التعاميم (يبدو ناقصاً أيضاً)
import LawsManagement from './pages/admin/LawsManagement';
import LawForm from './pages/admin/LawForm'; // 👈 استيراد نموذج القوانين (يبدو ناقصاً أيضاً)
import NewsManagement from './pages/admin/NewsManagement';
import NewsForm from './pages/admin/NewsForm';
import ProjectsManagement from './pages/admin/ProjectsManagement';
import ProjectForm from './pages/admin/ProjectForm';
import ExhibitionsManagement from './pages/admin/ExhibitionsManagement';
import ExhibitionForm from './pages/admin/ExhibitionForm';
import OpportunitiesManagement from './pages/admin/OpportunitiesManagement';
import OpportunityForm from './pages/admin/OpportunityForm';
import BannerManagement from './pages/admin/BannerManagement';
import BannerForm from './pages/admin/BannerForm';
import FaqsManagement from './pages/admin/FaqsManagement';
import FaqForm from './pages/admin/FaqForm';
import PagesManagement from './pages/admin/PagesManagement';
import PageForm from './pages/admin/PageForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import UserForm from './pages/admin/UserForm';
import PublicNews from './pages/PublicNews';
import QrGenerator from './pages/admin/QrGenerator';

// ================= مكونات الحماية الذكية (Guards) ================= //

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
};

// ================================================================= //

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 👇 GLOBAL TOASTER ADDED HERE 👇 */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              fontFamily: 'Tajawal, sans-serif',
              fontWeight: 'bold',
            },
            success: {
              style: {
                background: '#198754',
              },
            },
            error: {
              style: {
                background: '#dc3545',
              },
            },
          }} 
        />
        
        <Routes>
          {/* ================= الموقع العام (متاح للجميع) ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/news" element={<PublicNews />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
            <Route path="/jobs" element={<RedirectToJobs />} />
            <Route path="/job-applications" element={<RedirectToJobs />} />
          </Route>
          
          {/* ================= شاشات تسجيل الدخول والاستعادة ================= */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
          
          {/* ================= لوحة الإدارة (مغلقة بالكامل ومحمية) ================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              
              <Route path="inbox" element={<Inbox />} />  
              
              <Route path="users" element={<UsersManagement />} />
              <Route path="users/create" element={<UserForm />} />
              <Route path="users/edit/:id" element={<UserForm />} />
              
              {/* 👇 المسارات التي تمت إضافتها 👇 */}
              <Route path="board-members" element={<BoardMembers />} />
              <Route path="board-members/create" element={<BoardMemberForm />} />
              <Route path="board-members/edit/:id" element={<BoardMemberForm />} />

              <Route path="circulars" element={<CircularsManagement />} />
              <Route path="circulars/create" element={<CircularForm />} />
              <Route path="circulars/edit/:id" element={<CircularForm />} />

              <Route path="laws" element={<LawsManagement />} />
              <Route path="laws/create" element={<LawForm />} />
              <Route path="laws/edit/:id" element={<LawForm />} />
              {/* 👆 نهاية المسارات المضافة 👆 */}
              
              <Route path="news" element={<NewsManagement />} />
              <Route path="news/create" element={<NewsForm />} />
              <Route path="news/edit/:id" element={<NewsForm />} />

              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="projects/create" element={<ProjectForm />} />
              <Route path="projects/edit/:id" element={<ProjectForm />} />
              
              <Route path="exhibitions" element={<ExhibitionsManagement />} />
              <Route path="exhibitions/create" element={<ExhibitionForm />} />
              <Route path="exhibitions/edit/:id" element={<ExhibitionForm />} />

              <Route path="opportunities" element={<OpportunitiesManagement />} />
              <Route path="opportunities/create" element={<OpportunityForm />} />
              <Route path="opportunities/edit/:id" element={<OpportunityForm />} />

              <Route path="banners" element={<BannerManagement />} />
              <Route path="banners/create" element={<BannerForm />} />
              <Route path="banners/edit/:id" element={<BannerForm />} />

              <Route path="faqs" element={<FaqsManagement />} />
              <Route path="faqs/create" element={<FaqForm />} />
              <Route path="faqs/edit/:id" element={<FaqForm />} />

              <Route path="pages" element={<PagesManagement />} />
              <Route path="pages/create" element={<PageForm />} />
              <Route path="pages/edit/:id" element={<PageForm />} />

              <Route path="qr-generator" element={<QrGenerator />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}