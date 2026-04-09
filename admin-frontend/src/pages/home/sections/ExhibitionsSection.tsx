import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import type { Exhibition } from "../../../types/public";
import ExhibitionCard from "../../../components/ExhibitionCard";

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
              <ExhibitionCard item={item} onClick={() => navigate('/exhibitions')} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}