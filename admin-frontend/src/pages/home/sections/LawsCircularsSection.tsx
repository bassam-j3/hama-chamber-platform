import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Law, Circular } from "../../../types/public";

interface Props { laws: Law[]; circulars: Circular[]; }

export default function LawsCircularsSection({ laws, circulars }: Props) {
  const navigate = useNavigate();
  if ((!laws || laws.length === 0) && (!circulars || circulars.length === 0)) return null;

  return (
    <section id="laws-section" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        
        {/* ================= قسم القوانين والتشريعات ================= */}
        {laws.length > 0 && (
          <div className="mb-5 pb-4">
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
              <div>
                <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
                  <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
                  القوانين والتشريعات
                </h2>
                <p className="text-secondary mb-0 fs-5">أحدث القوانين والتشريعات الصادرة</p>
              </div>
              <Link to="/laws" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
                عرض كل القوانين <span className="material-symbols-outlined fs-5">arrow_back</span>
              </Link>
            </div>

            <Row className="g-4">
              {laws.slice(0, 3).map(law => (
                <Col lg={4} md={6} sm={12} key={law.id}>
                  {/* 👈 استنساخ دقيق لـ NewsCard */}
                  <Card 
                    className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white cursor-pointer" 
                    onClick={() => navigate('/laws')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                      <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                        <span className="material-symbols-outlined fs-1">gavel</span>
                      </div>
                      <Badge bg="secondary" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90 fw-normal">
                        تشريع
                      </Badge>
                    </div>
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                        <span className="material-symbols-outlined fs-6">calendar_today</span> 
                        <span className="fw-medium">{formatDate(law.createdAt)}</span>
                      </div>
                      <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all line-clamp-2">
                        {law.title}
                      </Card.Title>
                      <Card.Text className="text-secondary small line-clamp-3 mb-4">
                        {stripHtml(law.content)}
                      </Card.Text>
                      <div className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">
                        اقرأ التفاصيل <span className="material-symbols-outlined fs-6">arrow_back</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* ================= قسم التعاميم الرسمية ================= */}
        {circulars.length > 0 && (
          <div className={laws.length > 0 ? "mt-5 pt-5 border-top border-light" : ""}>
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
              <div>
                <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
                  <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
                  التعاميم والقرارات
                </h2>
                <p className="text-secondary mb-0 fs-5">أحدث التعاميم والقرارات الرسمية</p>
              </div>
              <Link to="/circulars" className="btn btn-outline-info text-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
                عرض كل التعاميم <span className="material-symbols-outlined fs-5">arrow_back</span>
              </Link>
            </div>

            <Row className="g-4">
              {circulars.slice(0, 3).map(circular => (
                <Col lg={4} md={6} sm={12} key={circular.id}>
                  {/* 👈 استنساخ دقيق لـ NewsCard */}
                  <Card 
                    className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white cursor-pointer" 
                    onClick={() => navigate('/circulars')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                      {circular.imageUrl ? (
                        <Card.Img 
                          variant="top" 
                          src={circular.imageUrl} 
                          className="w-100 h-100 object-fit-cover transition-all group-hover-scale" 
                          alt={circular.title}
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                          <span className="material-symbols-outlined fs-1">assignment</span>
                        </div>
                      )}
                      <Badge bg="info" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90 fw-normal text-dark">
                        {circular.category || 'تعميم'}
                      </Badge>
                    </div>
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                        <span className="material-symbols-outlined fs-6">calendar_today</span> 
                        <span className="fw-medium">{formatDate(circular.createdAt)}</span>
                      </div>
                      <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all line-clamp-2">
                        {circular.title}
                      </Card.Title>
                      <Card.Text className="text-secondary small line-clamp-3 mb-4">
                        {stripHtml(circular.content)}
                      </Card.Text>
                      <div className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">
                        اقرأ التفاصيل <span className="material-symbols-outlined fs-6">arrow_back</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

      </Container>
    </section>
  );
}