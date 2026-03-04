import { Container, Row, Col } from "react-bootstrap";

export default function ContactSection() {
  return (
    <section id="contact-section" className="py-5 bg-primary text-white position-relative">
      <Container className="py-5 position-relative z-1">
        <Row className="align-items-center gy-5">
          <Col lg={6}>
            <h2 className="display-5 fw-bold mb-4">تواصل معنا</h2>
            <p className="mb-5 fs-5 text-white-50 lh-lg fw-light">نحن هنا للإجابة على جميع استفساراتكم وتقديم الدعم اللازم لنمو أعمالكم. زورونا في مقرنا أو تواصلوا معنا عبر القنوات المتاحة.</p>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-4">
                <div className="bg-white bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-lg flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                  <span className="material-symbols-outlined text-gold fs-2">location_on</span>
                </div>
                <div>
                  <p className="text-gold small fw-bold mb-1 tracking-widest text-uppercase">العنوان الرئيسي</p>
                  <p className="fs-5 fw-bold mb-0">حماة، شارع أبي الفداء، ساحة العاصي</p>
                </div>
              </div>
              <div className="d-flex align-items-start gap-4">
                <div className="bg-white bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-lg flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                  <span className="material-symbols-outlined text-gold fs-2">call</span>
                </div>
                <div>
                  <p className="text-gold small fw-bold mb-1 tracking-widest text-uppercase">مركز الاتصال</p>
                  <p className="fs-4 fw-bold mb-0 font-monospace" dir="ltr">+963 33 1234567</p>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={6}>
            <div className="rounded-4 overflow-hidden border border-5 border-white border-opacity-10 shadow-lg position-relative" style={{ height: "400px", backgroundColor: "#082a25" }}>
              <div className="position-absolute top-50 start-50 translate-middle z-1">
                <div className="bg-gold p-4 rounded-circle shadow-lg border border-4 border-primary">
                  <span className="material-symbols-outlined text-primary display-4">domain</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
