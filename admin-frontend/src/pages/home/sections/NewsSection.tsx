import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom"; // 👈 استيراد Link
import { formatDate, stripHtml } from "../../../utils/format";
import type { News } from "../../../types/public";

interface NewsSectionProps {
  news: News[];
  onSelectNews: (item: News) => void;
}

export default function NewsSection({ news, onSelectNews }: NewsSectionProps) {
  return (
    <section id="news-section" className="py-5 bg-white">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <div>
            <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} /> آخر الأخبار والتقارير
            </h2>
            <p className="text-secondary mb-0 fs-5">تابع مستجدات الحركة التجارية والاقتصادية في محافظة حماة</p>
          </div>
          {/* 👇 الزر الجديد الذي يأخذنا للصفحة المنفصلة */}
          <Link to="/news" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
            عرض كل الأخبار <span className="material-symbols-outlined fs-5">arrow_back</span>
          </Link>
        </div>
        
        {news.length === 0 ? (
          <div className="text-center p-5 text-muted">لا توجد أخبار.</div>
        ) : (
          <Row className="g-4">
            {news.slice(0, 3).map((item) => (
              <Col lg={4} md={6} key={item.id}>
                {/* ... باقي كود البطاقة كما هو بدون تعديل ... */}
                <Card className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-light bg-opacity-50 cursor-pointer" onClick={() => onSelectNews(item)}>
                  <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                    <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover transition-all group-hover-scale" />
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90">أخبار الغرفة</Badge>
                  </div>
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                      <span className="material-symbols-outlined fs-6">calendar_today</span> <span className="fw-medium">{formatDate(item.createdAt)}</span>
                    </div>
                    <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all">{item.title}</Card.Title>
                    <Card.Text className="text-secondary small line-clamp-3 mb-4">{stripHtml(item.content)}</Card.Text>
                    <div className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">اقرأ المزيد <span className="material-symbols-outlined fs-6">arrow_back</span></div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}