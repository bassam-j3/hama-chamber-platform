import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Placeholder, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import type { News } from '../types/public';
import NewsCard from '../components/NewsCard';
import NewsModal from './home/NewsModal';

export default function PublicNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/news');
      // تأكد من عرض الأخبار النشطة فقط
      setNews(response.data.filter((n: News) => n.isActive));
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('تعذر تحميل الأخبار. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, []);

  return (
    <div className="py-5" style={{ backgroundColor: '#f9fafc', minHeight: '100vh' }} dir="rtl">
      <Container>
        <div className="mb-5 text-center position-relative">
           {/* زر العودة للرئيسية */}
          <Button 
            variant="link" 
            className="position-absolute top-0 end-0 text-decoration-none fw-bold d-none d-md-flex align-items-center gap-2 text-secondary"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined">arrow_forward</span> العودة للرئيسية
          </Button>

          <h1 className="fw-bold text-primary mb-3">كل الأخبار والتقارير</h1>
          <p className="text-secondary fs-5">تابع أحدث الأخبار والفعاليات في غرفة تجارة حماة</p>
        </div>

        {/* حالة الخطأ (Error State) */}
        {error && !loading && (
          <div className="text-center py-5">
             <span className="material-symbols-outlined text-danger fs-1 mb-3">error</span>
             <h5 className="text-danger mb-4">{error}</h5>
             <Button variant="outline-primary" className="rounded-pill px-4" onClick={fetchNews}>إعادة المحاولة</Button>
          </div>
        )}

        {/* حالة التحميل (Loading Skeletons) */}
        {loading && (
           <Row className="g-4">
             {[...Array(6)].map((_, idx) => (
                <Col lg={4} md={6} key={idx}>
                  <div className="card h-100 border-0 rounded-4 shadow-sm">
                    <Placeholder as="div" animation="glow" style={{ height: "240px" }} className="w-100 bg-light rounded-top" />
                    <div className="card-body p-4">
                      <Placeholder as="p" animation="glow" className="mb-3"><Placeholder xs={4} size="sm" /></Placeholder>
                      <Placeholder as="h5" animation="glow" className="mb-3"><Placeholder xs={8} /><Placeholder xs={6} /></Placeholder>
                      <Placeholder as="p" animation="glow"><Placeholder xs={12} /><Placeholder xs={12} /><Placeholder xs={8} /></Placeholder>
                    </div>
                  </div>
                </Col>
             ))}
           </Row>
        )}

        {/* حالة عدم وجود بيانات (Empty State) */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm">
             <span className="material-symbols-outlined fs-1 mb-3 opacity-50">inbox</span>
             <h5>لا توجد أخبار منشورة حالياً.</h5>
          </div>
        )}

        {/* عرض البيانات (Data State) */}
        {!loading && !error && news.length > 0 && (
          <Row className="g-4">
            {news.map((item) => (
              <Col lg={4} md={6} sm={12} key={item.id}>
                <NewsCard item={item} onClick={setSelectedNews} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* نافذة تفاصيل الخبر */}
      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}