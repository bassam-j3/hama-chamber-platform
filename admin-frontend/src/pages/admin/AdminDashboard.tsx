// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  pages: number;
  news: number;
  boardMembers: number;
  projects: number;
  circulars: number;
  laws: number;
  exhibitions: number;
  opportunities: number;
  banners: number;
  faqs: number;
}

// أضفنا ألوان (Themes) لكل قسم لجعله أكثر جاذبية
const CONTENT_STATS: { key: keyof DashboardStats; label: string; icon: string; link: string; colorClass: string }[] = [
  { key: 'news', label: 'المقالات والأخبار', icon: 'campaign', link: '/admin/news', colorClass: 'text-primary bg-primary' },
  { key: 'projects', label: 'مشاريع الغرفة', icon: 'domain', link: '/admin/projects', colorClass: 'text-success bg-success' },
  { key: 'circulars', label: 'التعاميم والقرارات', icon: 'assignment', link: '/admin/circulars', colorClass: 'text-warning bg-warning' },
  { key: 'laws', label: 'القوانين والتشريعات', icon: 'gavel', link: '/admin/laws', colorClass: 'text-danger bg-danger' },
  { key: 'opportunities', label: 'الفرص التجارية', icon: 'handshake', link: '/admin/opportunities', colorClass: 'text-info bg-info' },
  { key: 'exhibitions', label: 'المعارض والوفود', icon: 'festival', link: '/admin/exhibitions', colorClass: 'text-secondary bg-secondary' },
  { key: 'pages', label: 'الصفحات الديناميكية', icon: 'post_add', link: '/admin/pages', colorClass: 'text-dark bg-dark' },
  { key: 'boardMembers', label: 'أعضاء المجلس', icon: 'groups', link: '/admin/board-members', colorClass: 'text-primary bg-primary' },
  { key: 'banners', label: 'صور الواجهة', icon: 'view_carousel', link: '/admin/banners', colorClass: 'text-success bg-success' },
  { key: 'faqs', label: 'الأسئلة الشائعة', icon: 'quiz', link: '/admin/faqs', colorClass: 'text-warning bg-warning' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth?.() || { user: { name: 'مدير النظام' } };

  // دالة لتوليد التحية بناءً على الوقت
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'طابت أوقاتك';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Container fluid className="px-0 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
           <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} />
           <h5 className="mt-3 text-primary fw-bold">جاري تحميل الإحصائيات...</h5>
        </div>
      </Container>
    );
  }

  const totalItems = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <Container fluid className="px-0">
      
      {/* ================= الترحيب والإجراءات السريعة ================= */}
      <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm mb-4 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-4 border border-light">
        <div className="d-flex align-items-center gap-4">
           <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '80px', height: '80px' }}>
              <span className="material-symbols-outlined display-4">waving_hand</span>
           </div>
           <div>
             <h3 className="fw-bold text-dark mb-1">{getGreeting()}، {user?.name?.split(' ')[0]}! 👋</h3>
             <p className="text-secondary mb-0">مرحباً بك في لوحة تحكم غرفة تجارة حماة. لديك <span className="fw-bold text-primary">{totalItems}</span> عنصر نشط في النظام حالياً.</p>
           </div>
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/news/create" className="btn btn-primary rounded-3 fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-translate-y transition-all">
            <span className="material-symbols-outlined fs-5">edit_document</span> كتابة مقال
          </Link>
          <Link to="/" className="btn btn-light border rounded-3 fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-translate-y transition-all" target="_blank">
            <span className="material-symbols-outlined fs-5">visibility</span> معاينة الموقع
          </Link>
        </div>
      </div>

      {/* ================= شبكة الإحصائيات ================= */}
      <Row className="g-4">
        {CONTENT_STATS.map(({ key, label, icon, link, colorClass }) => {
          const count = stats?.[key] ?? 0;
          return (
            <Col key={key} xs={12} sm={6} lg={4} xl={3}>
              <Link to={link} className="text-decoration-none d-block h-100 group">
                <Card className="border-0 rounded-4 h-100 transition-all shadow-sm hover-shadow-lg" style={{ overflow: 'hidden' }}>
                  <Card.Body className="p-4 position-relative z-1 d-flex flex-column justify-content-center">
                    
                    {/* ديكور خلفي خفيف */}
                    <div className={`position-absolute top-0 end-0 w-100 h-100 ${colorClass} bg-opacity-10 opacity-0 group-hover-opacity-100 transition-all z-0`} style={{ transitionDuration: '0.3s' }}></div>
                    
                    <div className="d-flex justify-content-between align-items-start z-1">
                      <div className={`rounded-4 p-3 d-flex align-items-center justify-content-center flex-shrink-0 ${colorClass} bg-opacity-10`} style={{ width: '60px', height: '60px' }}>
                        <span className={`material-symbols-outlined fs-1 ${colorClass.split(' ')[0]}`}>{icon}</span>
                      </div>
                      <span className="material-symbols-outlined text-muted opacity-25 group-hover-opacity-100 transition-all">arrow_outward</span>
                    </div>
                    
                    <div className="mt-4 z-1">
                      <h2 className="display-5 fw-bolder text-dark mb-0 lh-1">{count}</h2>
                      <p className="text-secondary fw-bold mt-2 mb-0">{label}</p>
                    </div>
                  </Card.Body>
                  
                  {/* خط سفلي ملون */}
                  <div className={`w-100 ${colorClass.split(' ')[1]}`} style={{ height: '4px' }}></div>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>

    </Container>
  );
}