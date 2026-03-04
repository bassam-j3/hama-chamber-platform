// src/components/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  const { user, logout } = useAuth?.() || { user: { name: 'مدير النظام', role: 'super_admin' }, logout: () => navigate('/') };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = (path: string) => {
    if (path.includes('/news')) return 'المقالات والأخبار';
    if (path.includes('/board-members')) return 'أعضاء المجلس';
    if (path.includes('/projects')) return 'مشاريع الغرفة';
    if (path.includes('/circulars')) return 'تعاميم وقرارات';
    if (path.includes('/laws')) return 'قوانين وتشريعات';
    if (path.includes('/exhibitions')) return 'معارض ووفود';
    if (path.includes('/opportunities')) return 'فرص تجارية';
    if (path.includes('/banners')) return 'صور الواجهة';
    if (path.includes('/faqs')) return 'الأسئلة الشائعة';
    if (path.includes('/pages')) return 'الصفحات الديناميكية';
    if (path.includes('/users')) return 'إدارة المدراء والصلاحيات'; 
    return 'لوحة التحكم'; 
  };

  return (
    <div className="d-flex w-100 vh-100 overflow-hidden" style={{ backgroundColor: '#f4f7f6' }} dir="rtl">
      
      {showSidebar && (
        <div 
          className="position-fixed top-0 end-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
          style={{ zIndex: 1040 }} 
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* ================= الشريط الجانبي ================= */}
      <aside className={`admin-sidebar d-flex flex-column bg-primary text-white shadow-lg flex-shrink-0 h-100 transition-all ${showSidebar ? 'show' : ''}`} style={{ width: '280px', zIndex: 1050 }}>
        
        <div className="p-4 flex-shrink-0 d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 overflow-hidden">
            <div className="bg-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center text-primary flex-shrink-0 transition-all hover-scale" style={{ width: '42px', height: '42px' }}>
               <span className="material-symbols-outlined fs-4">account_balance</span>
            </div>
            <div className="d-flex flex-column text-truncate">
              <h1 className="text-white fw-bold mb-0 lh-1 text-truncate" style={{ fontSize: '1.1rem' }}>غرفة تجارة حماة</h1>
              <p className="text-white-50 mb-0 mt-1 fw-normal text-truncate" style={{ fontSize: '0.75rem' }}>بوابة الإدارة المركزية</p>
            </div>
          </div>
          <button className="btn btn-link text-white p-0 d-lg-none hover-text-gold transition-all" onClick={() => setShowSidebar(false)}>
            <span className="material-symbols-outlined fs-4">close</span>
          </button>
        </div>

        <nav className="flex-grow-1 d-flex flex-column gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar pe-3 ps-4 pb-4">
          <Link to="/admin" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname === '/admin' ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">dashboard</span> لوحة التحكم
          </Link>
          
          {user?.role === 'super_admin' && (
            <Link to="/admin/users" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/users') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
              <span className="material-symbols-outlined fs-5 transition-all">manage_accounts</span> إدارة المدراء
            </Link>
            
          )}

          <div className="text-white-50 small fw-bold mt-3 mb-1 px-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>إدارة المحتوى</div>
          <Link to="/admin/inbox" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/inbox') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">inbox</span> البريد الوارد
          </Link>
          <Link to="/admin/news" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/news') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">campaign</span> المقالات والأخبار
          </Link>
          <Link to="/admin/projects" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/projects') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">domain</span> مشاريع الغرفة
          </Link>
          <Link to="/admin/circulars" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/circulars') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">assignment</span> تعاميم وقرارات
          </Link>
          <Link to="/admin/laws" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/laws') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">gavel</span> قوانين وتشريعات
          </Link>
          <Link to="/admin/opportunities" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/opportunities') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">handshake</span> فرص تجارية
          </Link>
          <Link to="/admin/exhibitions" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/exhibitions') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">festival</span> معارض ووفود
          </Link>

          <div className="text-white-50 small fw-bold mt-3 mb-1 px-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>إعدادات الواجهة</div>
          
          <Link to="/admin/banners" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/banners') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">view_carousel</span> صور الواجهة (البانر)
          </Link>
          <Link to="/admin/board-members" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/board-members') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">groups</span> أعضاء المجلس
          </Link>
          <Link to="/admin/faqs" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/faqs') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">quiz</span> الأسئلة الشائعة
          </Link>
          <Link to="/admin/pages" className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${location.pathname.includes('/admin/pages') ? 'bg-white bg-opacity-10 text-white fw-bold border-end border-3 border-gold' : 'text-white-50 hover-text-white hover-bg-white hover-bg-opacity-10'}`}>
            <span className="material-symbols-outlined fs-5 transition-all">post_add</span> الصفحات الديناميكية
          </Link>
        </nav>

        <div className="p-4 flex-shrink-0 border-top border-white border-opacity-10 bg-dark bg-opacity-10">
          <div className="d-flex align-items-center justify-content-between px-1">
             <div className="d-flex align-items-center gap-3 overflow-hidden">
                <div className="bg-gold text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm fw-bold flex-shrink-0 transition-all hover-scale" style={{ width: '40px', height: '40px' }}>
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <div className="d-flex flex-column text-truncate">
                   <span className="small fw-bold lh-1 text-white text-truncate">{user?.name || 'مدير النظام'}</span>
                   <span className="text-white-50 lh-1 mt-2" style={{ fontSize: '0.7rem' }}>{user?.role === 'super_admin' ? 'مدير عام' : 'مدير إداري'}</span>
                </div>
             </div>
             {/* زر تسجيل الخروج مع تأثير التحويم */}
             <button onClick={handleLogout} className="btn btn-link text-white-50 p-0 hover-text-danger hover-scale transition-all flex-shrink-0 ms-2" title="تسجيل الخروج">
               <span className="material-symbols-outlined fs-5">logout</span>
             </button>
          </div>
        </div>
      </aside>

      {/* ================= منطقة المحتوى (Main Content Area) ================= */}
      <main className="flex-grow-1 d-flex flex-column h-100 overflow-hidden position-relative" style={{ minWidth: 0 }}>
        
        <header className="flex-shrink-0 bg-white border-bottom shadow-sm d-flex align-items-center justify-content-between px-3 px-md-4 z-1" style={{ height: '70px', borderColor: '#e8f3f1' }}>
          
          <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
            {/* زر الموبايل مع تأثير التحويم */}
            <button className="btn btn-light d-lg-none p-1 d-flex align-items-center justify-content-center text-primary border-0 me-2 shadow-sm rounded-3 hover-bg-primary hover-text-white transition-all hover-translate-y" onClick={() => setShowSidebar(true)}>
              <span className="material-symbols-outlined fs-5">menu</span>
            </button>

            {/* رابط الرئيسية مع تأثير التحويم الذهبي */}
            <Link to="/admin" className="text-decoration-none text-primary hover-text-gold transition-all d-none d-sm-flex align-items-center gap-1">
              <span className="material-symbols-outlined fs-6">home</span> الرئيسية
            </Link>
            {location.pathname !== '/admin' && (
              <>
                <span className="small text-muted d-none d-sm-inline">/</span>
                <span className="text-dark fw-bold d-none d-sm-inline">{getPageTitle(location.pathname)}</span>
                <span className="text-dark fw-bold d-inline d-sm-none fs-6">{getPageTitle(location.pathname)}</span>
              </>
            )}
          </div>
          
          <div className="d-flex align-items-center gap-2 gap-md-4">
            <div className="position-relative d-none d-md-block">
              <span className="material-symbols-outlined position-absolute top-50 translate-middle-y text-secondary fs-5" style={{ right: '12px' }}>search</span>
              {/* حقل البحث مع تأثير التركيز (Focus) */}
              <input type="text" className="form-control border-0 rounded-pill text-sm ps-4 pe-5 py-2 shadow-none search-input-hover" placeholder="ابحث هنا..." style={{ width: '250px', backgroundColor: '#f0f5f4' }} />
            </div>
            
            <div className="d-flex align-items-center gap-2 border-end-md pe-md-3 me-md-1" style={{ borderColor: '#e8f3f1' }}>
              {/* زر معاينة الموقع العام مع تأثير احترافي */}
              <Link to="/" className="btn btn-light rounded-circle p-2 text-secondary border-0 shadow-sm bg-light hover-bg-primary hover-text-white transition-all d-flex align-items-center justify-content-center hover-translate-y" title="عرض الموقع العام" target="_blank">
                <span className="material-symbols-outlined fs-5">public</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-grow-1 overflow-auto p-3 p-md-4 p-xl-5 custom-scrollbar bg-transparent">
          <div className="container-fluid mx-auto p-0" style={{ maxWidth: '1200px' }}>
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
}