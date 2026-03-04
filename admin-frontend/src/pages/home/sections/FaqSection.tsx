import { Container, Row, Col, Accordion } from "react-bootstrap";
import type { Faq } from "../../../types/public";

interface FaqSectionProps {
  faqs: Faq[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section id="faqs-section" className="py-5 bg-white">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold text-primary mb-3">الأسئلة الشائعة</h2>
          <div className="bg-gold mx-auto mb-4 rounded-pill" style={{ width: "80px", height: "6px" }} />
        </div>
        <Row className="justify-content-center">
          <Col lg={8}>
            {faqs.length === 0 ? (
              <div className="text-center text-muted">لا توجد أسئلة مضافة.</div>
            ) : (
              <Accordion className="shadow-sm rounded-4 overflow-hidden border border-light bg-light bg-opacity-50 p-2">
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={faq.id} className="border-0 border-bottom bg-transparent">
                    <Accordion.Header className="fw-bold text-dark px-2 py-2 fs-6">{faq.question}</Accordion.Header>
                    <Accordion.Body className="text-secondary lh-lg px-4 pb-4 pt-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
