// src/pages/admin/FaqsManagement.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Faq { id: string; question: string; answer: string; isActive: boolean; createdAt: string; }

export default function FaqsManagement() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/faqs");
      setFaqs(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/faqs/${itemToDelete}`);
      setFaqs(faqs.filter(f => f.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };

  const stripHtml = (html: string) => { const doc = new DOMParser().parseFromString(html, 'text/html'); return doc.body.textContent || ""; };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">quiz</span>
                  <h4 className="text-primary fw-bold mb-0">الأسئلة الشائعة (FAQ)</h4>
                </div>
                
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/faqs/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة سؤال جديد
                </Button>
              </div>

              {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
              : faqs.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد أسئلة شائعة مضافة حالياً</h5></div>) 
              : (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace text-start">السؤال</th>
                      <th className="text-secondary font-monospace text-start">الإجابة (مقتطف)</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq) => (
                      <tr key={faq.id}>
                        <td className="fw-bold text-dark text-start">{faq.question}</td>
                        <td className="text-muted text-start text-truncate" style={{ maxWidth: '200px' }}>{stripHtml(faq.answer)}</td>
                        <td>{faq.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">منشور</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">مخفي</Badge>}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/faqs/edit/${faq.id}`, { state: { faqItem: faq } })}>تعديل</Button>
                          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(faq.id); setShowDeleteModal(true); }}>حذف</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-2">warning</span>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا السؤال بشكل نهائي؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف السؤال"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}