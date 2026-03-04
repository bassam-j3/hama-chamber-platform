import { Container, Row, Col, Card, ListGroup, Tab, Tabs, Button, Badge } from "react-bootstrap";
import { formatDate } from "../../../utils/format";
import type { Law, Circular } from "../../../types/public";

interface LawsCircularsSectionProps {
  laws: Law[];
  circulars: Circular[];
}

export default function LawsCircularsSection({ laws, circulars }: LawsCircularsSectionProps) {
  return (
    <section id="laws-section" className="py-5 bg-light">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold text-primary mb-3">مركز المعلومات والقرارات</h2>
          <div className="bg-gold mx-auto mb-4 rounded-pill" style={{ width: "80px", height: "6px" }} />
        </div>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden bg-white">
              <Card.Header className="bg-white border-bottom-0 p-0">
                <Tabs defaultActiveKey="laws" className="nav-tabs-custom justify-content-center border-0 bg-light p-2 rounded-top-4 gap-2">
                  <Tab eventKey="laws" title={<span className="d-flex align-items-center gap-2 px-3 py-2 fw-bold"><span className="material-symbols-outlined">gavel</span> القوانين والتشريعات</span>}>
                    <div className="p-4 bg-white">
                      {laws.length === 0 ? (
                        <div className="text-center text-muted py-4">لا توجد قوانين.</div>
                      ) : (
                        <ListGroup variant="flush" className="gap-3">
                          {laws.map((law) => (
                            <ListGroup.Item key={law.id} className="border border-light rounded-4 p-4 hover-translate-y d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 shadow-sm">
                              <div className="d-flex align-items-start gap-4">
                                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 d-flex align-items-center justify-content-center" style={{ minWidth: "60px", height: "60px" }}><span className="material-symbols-outlined fs-2">balance</span></div>
                                <div>
                                  <h5 className="fw-bold text-dark mb-2">{law.title}</h5>
                                  <p className="text-secondary small mb-2">{law.content}</p>
                                  <small className="text-muted fw-bold d-flex align-items-center gap-1"><span className="material-symbols-outlined fs-6 text-gold">event</span> {formatDate(law.createdAt)}</small>
                                </div>
                              </div>
                              {law.fileUrl && <Button variant="outline-primary" href={law.fileUrl} target="_blank" rel="noopener noreferrer" className="fw-bold rounded-pill px-4 flex-shrink-0">تحميل <span className="material-symbols-outlined fs-6 align-middle ms-1">download</span></Button>}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  </Tab>
                  <Tab eventKey="circulars" title={<span className="d-flex align-items-center gap-2 px-3 py-2 fw-bold"><span className="material-symbols-outlined">assignment</span> التعاميم والقرارات</span>}>
                    <div className="p-4 bg-white">
                      {circulars.length === 0 ? (
                        <div className="text-center text-muted py-4">لا توجد تعاميم.</div>
                      ) : (
                        <ListGroup variant="flush" className="gap-3">
                          {circulars.map((circular) => (
                            <ListGroup.Item key={circular.id} className="border border-light rounded-4 p-4 hover-translate-y d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 shadow-sm">
                              <div className="d-flex align-items-start gap-4">
                                <div className="bg-gold bg-opacity-25 text-primary p-3 rounded-3 d-flex align-items-center justify-content-center" style={{ minWidth: "60px", height: "60px" }}><span className="material-symbols-outlined fs-2">notifications</span></div>
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                    <h5 className="fw-bold text-dark mb-0">{circular.title}</h5>
                                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary rounded-pill fw-normal px-2 py-1">{circular.category}</Badge>
                                  </div>
                                  <p className="text-secondary small mb-2 line-clamp-2">{circular.content}</p>
                                  <small className="text-muted fw-bold d-flex align-items-center gap-1"><span className="material-symbols-outlined fs-6 text-gold">schedule</span> {formatDate(circular.createdAt)}</small>
                                </div>
                              </div>
                              {circular.imageUrl && <Button variant="outline-dark" href={circular.imageUrl} target="_blank" rel="noopener noreferrer" className="fw-bold rounded-pill px-4 flex-shrink-0">المرفق <span className="material-symbols-outlined fs-6 align-middle ms-1">visibility</span></Button>}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
