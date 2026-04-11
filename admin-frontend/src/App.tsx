import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Toaster } from 'react-hot-toast'; 

import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import RoleGuard from './components/RoleGuard';
import { Spinner } from 'react-bootstrap';

// Lazy load Public Pages
const PublicHome = React.lazy(() => import('./pages/PublicHome'));
const PublicNews = React.lazy(() => import('./pages/PublicNews'));
const PublicProjects = React.lazy(() => import('./pages/PublicProjects'));
const PublicLaws = React.lazy(() => import('./pages/PublicLaws'));
const PublicCirculars = React.lazy(() => import('./pages/PublicCirculars'));
const PublicExhibitions = React.lazy(() => import('./pages/PublicExhibitions'));
const PublicOpportunities = React.lazy(() => import('./pages/PublicOpportunities'));
const PublicBoardMembers = React.lazy(() => import('./pages/PublicBoardMembers'));
const PublicFaqs = React.lazy(() => import('./pages/PublicFaqs'));
const DynamicPage = React.lazy(() => import('./pages/DynamicPage'));
const RedirectToJobs = React.lazy(() => import('./pages/RedirectToJobs'));
const Login = React.lazy(() => import('./pages/Login')); 
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

// Lazy load Admin Pages
const Inbox = React.lazy(() => import('./pages/admin/Inbox'));
const BoardMembers = React.lazy(() => import('./pages/admin/BoardMembers'));
const BoardMemberForm = React.lazy(() => import('./pages/admin/BoardMemberForm')); 
const CircularsManagement = React.lazy(() => import('./pages/admin/CircularsManagement'));
const CircularForm = React.lazy(() => import('./pages/admin/CircularForm')); 
const LawsManagement = React.lazy(() => import('./pages/admin/LawsManagement'));
const LawForm = React.lazy(() => import('./pages/admin/LawForm')); 
const NewsManagement = React.lazy(() => import('./pages/admin/NewsManagement'));
const NewsForm = React.lazy(() => import('./pages/admin/NewsForm'));
const ProjectsManagement = React.lazy(() => import('./pages/admin/ProjectsManagement'));
const ProjectForm = React.lazy(() => import('./pages/admin/ProjectForm'));
const ExhibitionsManagement = React.lazy(() => import('./pages/admin/ExhibitionsManagement'));
const ExhibitionForm = React.lazy(() => import('./pages/admin/ExhibitionForm'));
const OpportunitiesManagement = React.lazy(() => import('./pages/admin/OpportunitiesManagement'));
const OpportunityForm = React.lazy(() => import('./pages/admin/OpportunityForm'));
const BannerManagement = React.lazy(() => import('./pages/admin/BannerManagement'));
const BannerForm = React.lazy(() => import('./pages/admin/BannerForm'));
const FaqsManagement = React.lazy(() => import('./pages/admin/FaqsManagement'));
const FaqForm = React.lazy(() => import('./pages/admin/FaqForm'));
const PagesManagement = React.lazy(() => import('./pages/admin/PagesManagement'));
const PageForm = React.lazy(() => import('./pages/admin/PageForm'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UsersManagement = React.lazy(() => import('./pages/admin/UsersManagement'));
const UserForm = React.lazy(() => import('./pages/admin/UserForm'));
const QrGenerator = React.lazy(() => import('./pages/admin/QrGenerator'));

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="d-flex vh-100 justify-content-center align-items-center"><Spinner animation="border" variant="primary" /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="d-flex vh-100 justify-content-center align-items-center"><Spinner animation="border" variant="primary" /></div>;
  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
};

const Loader = () => (
  <div className="d-flex vh-100 justify-content-center align-items-center">
    <Spinner animation="border" variant="primary" />
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff', fontFamily: 'Tajawal, sans-serif', fontWeight: 'bold' },
            success: { style: { background: '#198754' } },
            error: { style: { background: '#dc3545' } },
          }} 
        />
        
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/news" element={<PublicNews />} />
              <Route path="/projects" element={<PublicProjects />} />
              {/* 👇 إضافة روابط الأقسام الجديدة 👇 */}
              <Route path="/laws" element={<PublicLaws />} />
              <Route path="/circulars" element={<PublicCirculars />} />
              <Route path="/exhibitions" element={<PublicExhibitions />} />
              <Route path="/opportunities" element={<PublicOpportunities />} />
              <Route path="/board-members" element={<PublicBoardMembers />} />
              <Route path="/faqs" element={<PublicFaqs />} />
              
              <Route path="/page/:slug" element={<DynamicPage />} />
              <Route path="/jobs" element={<RedirectToJobs />} />
              <Route path="/job-applications" element={<RedirectToJobs />} />
            </Route>
            
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="inbox" element={<Inbox />} />  
                
                <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="users/create" element={<UserForm />} />
                  <Route path="users/edit/:id" element={<UserForm />} />
                </Route>
                
                <Route path="board-members" element={<BoardMembers />} />
                <Route path="board-members/create" element={<BoardMemberForm />} />
                <Route path="board-members/edit/:id" element={<BoardMemberForm />} />

                <Route path="circulars" element={<CircularsManagement />} />
                <Route path="circulars/create" element={<CircularForm />} />
                <Route path="circulars/edit/:id" element={<CircularForm />} />

                <Route path="laws" element={<LawsManagement />} />
                <Route path="laws/create" element={<LawForm />} />
                <Route path="laws/edit/:id" element={<LawForm />} />
                
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
        </Suspense>
      </AuthProvider>
    </Router>
  );
}