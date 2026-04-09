import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Law, Circular } from "../../../types/public";
import LawCard from "../../../components/LawCard";
import CircularCard from "../../../components/CircularCard";

interface LawsCircularsSectionProps { 
  laws: Law[]; 
  circulars: Circular[]; 
  onSelectLaw: (item: Law) => void;
  onSelectCircular: (item: Circular) => void;
}

export default function LawsCircularsSection({ laws, circulars, onSelectLaw, onSelectCircular }: LawsCircularsSectionProps) {
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
                  {/* استدعاء البطاقة وتمرير الدالة لفتح النافذة */}
                  <LawCard item={law} onClick={onSelectLaw} />
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
                  {/* استدعاء البطاقة وتمرير الدالة لفتح النافذة */}
                  <CircularCard item={circular} onClick={onSelectCircular} />
                </Col>
              ))}
            </Row>
          </div>
        )}

      </Container>
    </section>
  );
}