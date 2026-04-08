import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Law, Circular } from "../../../types/public";

interface Props { laws: Law[]; circulars: Circular[]; }

export default function LawsCircularsSection({ laws, circulars }: Props) {
  if ((!laws || laws.length === 0) && (!circulars || circulars.length === 0)) return null;

  return (
    <section id="laws-section" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        <div className="mb-5 text-center">
          <h2 className="h2 fw-bold text-primary mb-3">
            مركز المعلومات والقرارات
          </h2>
          <p className="text-secondary mb-0 fs-5">أحدث القوانين والتشريعات والتعاميم الصادرة</p>
        </div>
        
        <Row className="g-4">
          {/* عمود القوانين */}
          {laws.length > 0 && (
            <Col xs={12} lg={6}>
               <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                 <span className="material-symbols-outlined text-primary">gavel</span> القوانين والتشريعات
               </h4>
               <div className="d-flex flex-column gap-3">
                 {laws.slice(0, 3).map(law => (
                    <Card key={law.id} className="border-0 shadow-sm rounded-4 hover-translate-y transition-all bg-light">
                      <Card.Body className="p-4 d-flex flex-column flex-sm-row gap-3 align-items-start">
                         <div className="bg-white text-primary p-3 rounded-circle shadow-sm d-none d-sm-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <span className="material-symbols-outlined fs-3">balance</span>
                         </div>
                         <div className="flex-grow-1 w-100">
                           <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                              <h5 className="fw-bold text-dark mb-0 flex-grow-1 pe-2">{law.title}</h5>
                              <span className="text-secondary small whitespace-nowrap">{formatDate(law.createdAt)}</span>
                           </div>
                           <p className="text-secondary small line-clamp-2 mb-0">{stripHtml(law.content)}</p>
                         </div>
                      </Card.Body>
                    </Card>
                 ))}
               </div>
            </Col>
          )}

          {/* عمود التعاميم */}
          {circulars.length > 0 && (
            <Col xs={12} lg={6}>
               <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                 <span className="material-symbols-outlined text-info">assignment</span> التعاميم الرسمية
               </h4>
               <div className="d-flex flex-column gap-3">
                 {circulars.slice(0, 3).map(circular => (
                    <Card key={circular.id} className="border-0 shadow-sm rounded-4 hover-translate-y transition-all border-end border-4 border-info bg-light">
                      <Card.Body className="p-4 d-flex flex-column">
                           <div className="d-flex flex-wrap justify-content-between align-items-start mb-3 gap-2">
                              <Badge bg="info" className="text-dark rounded-pill px-3 py-2 fw-medium shadow-sm">{circular.category}</Badge>
                              <span className="text-secondary small">{formatDate(circular.createdAt)}</span>
                           </div>
                           <h5 className="fw-bold text-dark mb-2">{circular.title}</h5>
                           <p className="text-secondary small line-clamp-2 mb-0">{stripHtml(circular.content)}</p>
                      </Card.Body>
                    </Card>
                 ))}
               </div>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
}