import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Exhibition } from "../../../types/public";

export default function ExhibitionsSection({ exhibitions }: { exhibitions: Exhibition[] }) {
  const navigate = useNavigate();
  if (!exhibitions || exhibitions.length === 0) return null;

  return (
    <section id="exhibitions" className="py-5 bg-light" dir="rtl">
      <Container className="py-5">
        
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <div>
            <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
              المعارض والمؤتمرات
            </h2>
            <p className="text-secondary mb-0 fs-5">مشاركات الغرفة في الفعاليات والمعارض المحلية والدولية</p>
          </div>
          
          <Link to="/exhibitions" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
            عرض كل المعارض <span className="material-symbols-outlined fs-5">arrow_back</span>
          </Link>
        </div>

        <Row className="g-4">
          {exhibitions.slice(0, 3).map((item) => (
            <Col lg={4} md={6} sm={12} key={item.id}>
              {/* 👈 تم استنساخ NewsCard بدقة هنا 👇 */}
              <Card 
                className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white cursor-pointer" 
                onClick={() => navigate('/exhibitions')}
                style={{ cursor: 'pointer' }}
              >
                <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                  {item.imageUrl ? (
                    <Card.Img 
                      variant="top" 
                      src={item.imageUrl} 
                      className="w-100 h-100 object-fit-cover transition-all group-hover-scale" 
                      alt={item.title}
                    />
                  ) : (
                    <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                       <span className="material-symbols-outlined fs-1">festival</span>
                    </div>
                  )}
                  <Badge bg="info" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90 fw-normal text-dark">
                    فعالية
                  </Badge>
                </div>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                    <span className="material-symbols-outlined fs-6">calendar_today</span> 
                    <span className="fw-medium">{formatDate(item.createdAt)}</span>
                  </div>
                  <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all line-clamp-2">
                    {item.title}
                  </Card.Title>
                  <Card.Text className="text-secondary small line-clamp-3 mb-4">
                    {stripHtml(item.content)}
                  </Card.Text>
                  <div className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">
                    اقرأ التفاصيل <span className="material-symbols-outlined fs-6">arrow_back</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

      </Container>
    </section>
  );
}