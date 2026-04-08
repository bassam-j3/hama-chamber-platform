import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Opportunity } from "../../../types/public";

export default function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  const navigate = useNavigate();
  if (!opportunities || opportunities.length === 0) return null;
  
  return (
    <section id="opportunities" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        <div className="mb-5">
          <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
            <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
            الفرص الاستثمارية والمناقصات
          </h2>
          <p className="text-secondary mb-0 fs-5">أهم الفرص المتاحة للاستثمار والتجارة والتطوير</p>
        </div>
        <Row className="g-4">
          {opportunities.slice(0, 3).map((item) => (
            <Col xs={12} sm={6} lg={4} key={item.id}>
              {/* نفس كلاسات بطاقة الأخبار تماماً */}
              <Card 
                className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white cursor-pointer"
                onClick={() => navigate('/opportunities')}
              >
                 <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                  {item.imageUrl ? (
                    <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover transition-all group-hover-scale" />
                  ) : (
                    <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                       <span className="material-symbols-outlined fs-1 text-muted">handshake</span>
                    </div>
                  )}
                  <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90 fw-normal">
                    فرصة متاحة
                  </Badge>
                </div>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                    <span className="material-symbols-outlined fs-6">calendar_month</span>
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