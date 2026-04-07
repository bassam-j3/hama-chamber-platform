import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { News } from "../../../types/public";
import NewsCard from "../../../components/NewsCard";

interface NewsSectionProps {
  news: News[];
  onSelectNews: (item: News) => void;
}

export default function NewsSection({ news, onSelectNews }: NewsSectionProps) {
  if (!news || news.length === 0) return null; // لا نعرض القسم إذا لم يكن هناك أخبار

  return (
    <section id="news-section" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <div>
            <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} /> 
              آخر الأخبار والتقارير
            </h2>
            <p className="text-secondary mb-0 fs-5">تابع مستجدات الحركة التجارية والاقتصادية في محافظة حماة</p>
          </div>
          
          <Link to="/news" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
            عرض كل الأخبار <span className="material-symbols-outlined fs-5">arrow_back</span>
          </Link>
        </div>
        
        <Row className="g-4">
          {news.slice(0, 3).map((item) => (
            <Col lg={4} md={6} sm={12} key={item.id}>
              <NewsCard item={item} onClick={onSelectNews} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}