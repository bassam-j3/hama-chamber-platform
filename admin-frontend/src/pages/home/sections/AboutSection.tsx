import { Container, Row, Col } from "react-bootstrap";
import logoImg from '../../../../hamachamberlogo.svg';

export default function AboutSection() {
  return (
    <section id="about" className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        <Row className="align-items-center">
          <Col lg={8}>
            <h2 className="h2 fw-bold text-primary mb-4 d-flex align-items-center gap-3">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
              نبذة عن الغرفة
            </h2>
            <h4 className="text-dark fw-bold mb-3">أهلا بكم في غرفة تجارة حماة</h4>
            <p className="text-secondary fs-5 lh-lg mb-3">
              تأسست غرفة تجارة حماة عام 1934، وهي مؤسسة ذات نفع عام غايتها خدمة المصالح التجارية والصناعية والدفاع عنها والعمل على تطويرها وتعزيزها. وبناءً على ذلك فقد سعت مجالس إدارتها المتتالية منذ ذلك الحين إلى دعم الحركة الصناعية والتجارية، وكان لها الدور البارز في إقامة العديد من المشاريع الخدمية والصناعية والتجارية الناجحة.
            </p>
            <p className="text-secondary fs-5 lh-lg mb-0">
              وبصدور قانون الغرف التجارية رقم /131/ لعام 1959، كان للغرفة دور بارز في الشؤون الاقتصادية وتنشيط التجارة وحمايتها وتوجيهها، إضافة إلى إقامة المعارض والأسواق التجارية والمشاركة في المؤتمرات الاقتصادية.
            </p>
          </Col>
          <Col lg={4} className="d-none d-lg-flex justify-content-center">
          <div className="p-4 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center border border-light transition-all hover-scale overflow-hidden" style={{ width: '250px', height: '250px' }}>
              {/* 👈 قمنا بوضع الشعار هنا بدلاً من الأيقونة */}
              <img 
                src="/hamachamberlogo.svg" 
                alt="شعار غرفة تجارة حماة" 
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}