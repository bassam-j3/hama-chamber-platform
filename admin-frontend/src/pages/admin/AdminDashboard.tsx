// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Container, Row, Col, Card, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  pages: number; news: number; boardMembers: number; projects: number; circulars: number; laws: number; exhibitions: number; opportunities: number; banners: number; faqs: number;
}

interface RecentActivity {
  id: string; title: string; createdAt: string; type: string; icon: string;
}

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
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const { user } = useAuth?.() || { user: { name: 'مدير النظام' } };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axiosInstance.get('/dashboard/stats'),
          axiosInstance.get('/dashboard/recent-activity')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'طابت أوقاتك';
  };

  if (isLoading) {
    return (
      <Container fluid className="px-0 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
           <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} />
           <h5 className="mt-3 text-primary fw-bold">جاري تحضير لوحة التحكم...</h5>
        </div>
      </Container>
    );
  }

  const totalItems = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <Container fluid className="px-0 pb-5" dir="rtl">
      
      {/* ================= الترحيب والإجراءات السريعة ================= */}
      <div className="bg-white rounded-4 p-4 p-md-5 shadow-sm mb-4 border border-light position-relative overflow-hidden">
        {/* Background Decor */}
        <div className="position-absolute top-0 end-0 p-5 opacity-05 pointer-events-none">
           <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>dashboard</span>
        </div>

        <Row className="align-items-center position-relative z-1">
          <Col lg={8}>
            <div className="d-flex align-items-center gap-4 mb-4 mb-lg-0">
               <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center shadow-sm flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                  <span className="material-symbols-outlined display-4">shield_person</span>
               </div>
               <div>
                 <h2 className="fw-bold text-dark mb-1">{getGreeting()}، {user?.name?.split(' ')[0]}!</h2>
                 <p className="text-secondary fs-5 mb-0">أهلاً بك مجدداً. النظام يعمل بكفاءة ولدينا <span className="fw-bold text-primary">{totalItems}</span> عنصر نشط.</p>
               </div>
            </div>
          </Col>
          <Col lg={4} className="text-lg-end">
            <div className="bg-light p-3 rounded-4 d-inline-block shadow-sm text-center border">
              <div className="fw-bold text-primary h4 mb-0 font-monospace" dir="ltr">
                {time.toLocaleTimeString('ar-EG', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-muted small fw-bold mt-1">
                {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </Col>
        </Row>

        <hr className="my-4 opacity-10" />

        <div className="d-flex flex-wrap gap-3">
          <Link to="/admin/news/create" className="btn btn-primary rounded-pill fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-scale transition-all">
            <span className="material-symbols-outlined fs-5">edit_document</span> إضافة خبر
          </Link>
          <Link to="/admin/projects/create" className="btn btn-success text-white rounded-pill fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-scale transition-all">
            <span className="material-symbols-outlined fs-5">add_business</span> مشروع جديد
          </Link>
          <Link to="/admin/inbox" className="btn btn-warning text-dark rounded-pill fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-scale transition-all">
            <span className="material-symbols-outlined fs-5">mail</span> البريد الرسمي
          </Link>
          <Link to="/" className="btn btn-outline-secondary border rounded-pill fw-bold d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-scale transition-all" target="_blank">
            <span className="material-symbols-outlined fs-5">open_in_new</span> معاينة الموقع
          </Link>
        </div>
      </div>

      <Row className="g-4">
        {/* ================= شبكة الإحصائيات ================= */}
        <Col xl={8}>
          <Row className="g-3">
            {CONTENT_STATS.map(({ key, label, icon, link, colorClass }) => {
              const count = stats?.[key] ?? 0;
              return (
                <Col key={key} xs={12} sm={6} md={4}>
                  <Link to={link} className="text-decoration-none d-block h-100 group">
                    <Card className="border-0 rounded-4 h-100 transition-all shadow-sm hover-shadow-lg border-bottom border-4 border-light overflow-hidden">
                      <Card.Body className="p-4 position-relative z-1 d-flex flex-column justify-content-center">
                        <div className="d-flex justify-content-between align-items-start z-1">
                          <div className={`rounded-4 p-3 d-flex align-items-center justify-content-center flex-shrink-0 ${colorClass} bg-opacity-10`} style={{ width: '60px', height: '60px' }}>
                            <span className={`material-symbols-outlined fs-1 ${colorClass.split(' ')[0]}`}>{icon}</span>
                          </div>
                          <span className="material-symbols-outlined text-muted opacity-25 group-hover-opacity-100 transition-all">arrow_outward</span>
                        </div>
                        <div className="mt-4 z-1">
                          <h2 className="display-6 fw-bolder text-dark mb-0 lh-1">{count}</h2>
                          <p className="text-secondary fw-bold mt-2 mb-0">{label}</p>
                        </div>
                      </Card.Body>
                      <div className={`w-100 ${colorClass.split(' ')[1]}`} style={{ height: '4px' }}></div>
                    </Card>
                  </Link>
                </Col>
              );
            })}
          </Row>
        </Col>

        {/* ================= النشاط الأخير ================= */}
        <Col xl={4}>
          <Card className="border-0 rounded-4 shadow-sm h-100">
            <Card.Header className="bg-white border-0 p-4 pb-0">
               <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                 <span className="material-symbols-outlined">history</span>
                 أحدث النشاطات
               </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {activity.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                   <span className="material-symbols-outlined fs-1">inbox</span>
                   <p className="mt-2 fw-bold">لا يوجد نشاط مؤخراً</p>
                </div>
              ) : (
                <ListGroup variant="flush" className="gap-3">
                  {activity.map((item, idx) => (
                    <ListGroup.Item key={idx} className="border-0 p-3 bg-light rounded-4 hover-bg-white shadow-hover transition-all d-flex align-items-start gap-3">
                       <div className="bg-white rounded-circle p-2 shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="material-symbols-outlined text-primary fs-5">{item.icon}</span>
                       </div>
                       <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                             <Badge bg="primary" className="bg-opacity-10 text-primary small px-2 py-1 mb-1">{item.type === 'NEWS' ? 'خبر' : item.type === 'PROJECT' ? 'مشروع' : 'تعميم'}</Badge>
                             <small className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</small>
                          </div>
                          <h6 className="mb-0 text-dark fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{item.title}</h6>
                       </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <div className="mt-4 pt-3 border-top">
                 <div className="bg-gold bg-opacity-10 p-4 rounded-4 border border-gold border-opacity-20">
                    <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                       <span className="material-symbols-outlined fs-5">lightbulb</span>
                       نصيحة اليوم
                    </h6>
                    <p className="text-secondary small mb-0 lh-lg">قم بمراجعة قسم التعاميم والقرارات بانتظام للتأكد من مواكبة أحدث القوانين التجارية الصادرة من الوزارة.</p>
                 </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          .opacity-05 { opacity: 0.05; }
          .hover-scale:hover { transform: scale(1.05); }
          .shadow-hover:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important; }
          .bg-gold { background-color: #ffd700; }
          .border-gold { border-color: #ffd700; }
          .text-gold { color: #ffd700; }
          .hover-bg-white:hover { background-color: #fff !important; }
        `}
      </style>
    </Container>
  );
}
