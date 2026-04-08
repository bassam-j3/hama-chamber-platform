import { Container, Row, Col, Card } from "react-bootstrap";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Exhibition } from "../../../types/public";

export default function ExhibitionsSection({ exhibitions }: { exhibitions: Exhibition[] }) {
  if (!exhibitions || exhibitions.length === 0) return null;

  return (
    <section id="exhibitions-section" className="py-5 bg-light" dir="rtl">
      <Container className="py-5">
        <div className="mb-5">
          <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
            <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
            المعارض والمؤتمرات
          </h2>
          <p className="text-secondary mb-0 fs-5">مشاركات الغرفة في الفعاليات والمعارض المحلية والدولية</p>
        </div>
        <Row className="g-4">
          {exhibitions.slice(0, 3).map((item) => (
            <Col lg={4} md={6} sm={12} key={item.id}>
              <Card className="h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-translate-y transition-all bg-white">
                 <div style={{ height: "200px" }} className="bg-light d-flex align-items-center justify-content-center">
                  {item.imageUrl ? (
                    <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <span className="material-symbols-outlined fs-1 text-muted">storefront</span>
                  )}
                </div>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 text-primary small mb-3 fw-bold">
                    <span className="material-symbols-outlined fs-6">event</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
                  <Card.Text className="text-secondary small mb-0 line-clamp-3">{stripHtml(item.content)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}