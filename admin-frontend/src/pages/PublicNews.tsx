import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { formatDate, stripHtml } from '../utils/format';
import type { News } from '../types/public';

export default function PublicNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التمرير لأعلى الصفحة عند الدخول
    window.scrollTo(0, 0);
    
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get('/news');
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="py-5" style={{ backgroundColor: '#f9fafc', minHeight: '100vh' }}>
      <Container>
        <div className="mb-5 text-center">
          <h1 className="fw-bold text-primary mb-3">كل الأخبار والتقارير</h1>
          <p className="text-secondary fs-5">تابع أحدث الأخبار والفعاليات في غرفة تجارة حماة</p>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center text-muted p-5">لا توجد أخبار حالياً.</div>
        ) : (
          <Row className="g-4">
            {news.map((item) => (
              <Col lg={4} md={6} key={item.id}>
                {/* هنا نستخدم Link للانتقال إلى صفحة تفاصيل الخبر أو يمكن فتح Modal حسب رغبتك */}
                <Card className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white">
                  <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                    <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover transition-all group-hover-scale" />
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90">أخبار الغرفة</Badge>
                  </div>
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                      <span className="material-symbols-outlined fs-6">calendar_today</span> 
                      <span className="fw-medium">{formatDate(item.createdAt)}</span>
                    </div>
                    <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all">
                      {item.title}
                    </Card.Title>
                    <Card.Text className="text-secondary small line-clamp-3 mb-4">
                      {stripHtml(item.content)}
                    </Card.Text>
                    {/* سنقوم لاحقاً بإنشاء صفحة تفاصيل الخبر /news/:id */}
                    <Link to={`/`} className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">
                      اقرأ التفاصيل <span className="material-symbols-outlined fs-6">arrow_back</span>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}