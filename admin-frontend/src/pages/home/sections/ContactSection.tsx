import { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("جاري إرسال رسالتك...");

    try {
      await axiosInstance.post("/emails/contact", formData);
      toast.success("تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.", { id: toastId });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact Error:", error);
      toast.error("فشل إرسال الرسالة. يرجى المحاولة لاحقاً.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact-section" className="py-5 bg-primary text-white position-relative">
      <Container className="py-5 position-relative z-1">
        <Row className="align-items-center gy-5">
          <Col lg={5}>
            <div className="pe-lg-4">
              <h2 className="display-5 fw-bold mb-4">تواصل معنا</h2>
              <p className="mb-5 fs-5 text-white-50 lh-lg fw-light">
                نحن هنا للإجابة على جميع استفساراتكم وتقديم الدعم اللازم لنمو أعمالكم. 
                زورونا في مقرنا أو تواصلوا معنا عبر القنوات المتاحة.
              </p>
              
              <div className="d-flex flex-column gap-4 mb-5">
                <div className="d-flex align-items-start gap-4">
                  <div className="bg-white bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-lg flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                    <span className="material-symbols-outlined text-gold fs-2">location_on</span>
                  </div>
                  <div>
                    <p className="text-gold small fw-bold mb-1 tracking-widest text-uppercase">العنوان الرئيسي</p>
                    <p className="fs-5 fw-bold mb-0">حماة - ساحة العاصي</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start gap-4">
                  <div className="bg-white bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-lg flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                    <span className="material-symbols-outlined text-gold fs-2">call</span>
                  </div>
                  <div>
                    <p className="text-gold small fw-bold mb-1 tracking-widest text-uppercase">مركز الاتصال</p>
                    <p className="fs-4 fw-bold mb-0 font-monospace" dir="ltr">00963332517700</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-4">
                  <div className="bg-white bg-opacity-10 rounded-4 d-flex align-items-center justify-content-center border border-white border-opacity-10 shadow-lg flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                    <span className="material-symbols-outlined text-gold fs-2">mail</span>
                  </div>
                  <div>
                    <p className="text-gold small fw-bold mb-1 tracking-widest text-uppercase">البريد الإلكتروني</p>
                    <p className="fs-5 fw-bold mb-0">info@hama-chamber.org</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-4 overflow-hidden border border-5 border-white border-opacity-10 shadow-lg" style={{ height: "200px", backgroundColor: "#082a25" }}>
                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
                   <span className="material-symbols-outlined text-gold display-4 opacity-50">map</span>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={7}>
            <div className="bg-white rounded-4 p-4 p-md-5 shadow-lg text-dark">
              <h3 className="fw-bold text-primary mb-4">أرسل لنا رسالة</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-secondary">الاسم الكامل</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك هنا..." 
                        required 
                        className="bg-light border-0 py-3 px-4 rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-secondary">البريد الإلكتروني</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@domain.com" 
                        required 
                        className="bg-light border-0 py-3 px-4 rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-secondary">الموضوع</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="عن ماذا تود الاستفسار؟" 
                        required 
                        className="bg-light border-0 py-3 px-4 rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small text-secondary">الرسالة</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={5} 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="اكتب تفاصيل رسالتك هنا..." 
                        required 
                        className="bg-light border-0 py-3 px-4 rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : <span className="material-symbols-outlined">send</span>}
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة الآن"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Background Decor */}
      <div className="position-absolute bottom-0 start-0 w-100 h-100 overflow-hidden pointer-events-none opacity-10">
         <span className="material-symbols-outlined position-absolute" style={{ fontSize: '400px', bottom: '-100px', left: '-100px' }}>business</span>
      </div>
    </section>
  );
}
