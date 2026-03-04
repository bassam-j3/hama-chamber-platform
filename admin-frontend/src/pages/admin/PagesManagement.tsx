// src/pages/admin/PagesManagement.tsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../api/axiosInstance";

interface Page { id: string; title: string; slug: string; isActive: boolean; createdAt: string; }

export default function PagesManagement() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/pages");
      setPages(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/pages/${itemToDelete}`);
      setPages(pages.filter(p => p.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">article</span>
                  <h4 className="text-primary fw-bold mb-0">الصفحات الديناميكية</h4>
                </div>
                
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/pages/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة صفحة جديدة
                </Button>
              </div>

              {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
              : pages.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد صفحات مضافة حالياً</h5></div>) 
              : (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace text-start">عنوان الصفحة</th>
                      <th className="text-secondary font-monospace text-start">الرابط (Slug)</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id}>
                        <td className="fw-bold text-dark text-start">{page.title}</td>
                        <td className="text-start" dir="ltr">
                          <Badge bg="light" text="primary" className="border shadow-sm p-2 font-monospace">/page/{page.slug}</Badge>
                        </td>
                        <td>{page.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">منشورة</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">مسودة</Badge>}</td>
                        <td>
                          <Button variant="outline-dark" size="sm" className="me-2 fw-bold" onClick={() => window.open(`/page/${page.slug}`, '_blank')}>عرض</Button>
                          <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/pages/edit/${page.id}`, { state: { pageItem: page } })}>تعديل</Button>
                          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(page.id); setShowDeleteModal(true); }}>حذف</Button>
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
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذه الصفحة بشكل نهائي؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف الصفحة"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}