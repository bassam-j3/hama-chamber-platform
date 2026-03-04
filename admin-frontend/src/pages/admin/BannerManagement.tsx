// src/pages/admin/BannerManagement.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
}

export default function BannerManagement() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/banners");
      setBanners(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/banners/${itemToDelete}`);
      setBanners(banners.filter(b => b.id !== itemToDelete));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">image</span>
                  <h4 className="text-primary fw-bold mb-0">إدارة البانرات (Hero/Banner)</h4>
                </div>
                
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/banners/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة بانر جديد
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
              ) : banners.length === 0 ? (
                <div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد بانرات مضافة حالياً</h5></div>
              ) : (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace">الصورة</th>
                      <th className="text-secondary font-monospace text-start">العنوان</th>
                      <th className="text-secondary font-monospace">تاريخ الإضافة</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner.id}>
                        <td>
                          <div className="rounded overflow-hidden bg-light border d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '40px' }}>
                            <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </td>
                        <td className="fw-bold text-dark text-start">{banner.title}</td>
                        <td>{new Date(banner.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td>
                          {banner.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">نشط</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">غير نشط</Badge>}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/banners/edit/${banner.id}`, { state: { bannerItem: banner } })}>تعديل</Button>
                          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(banner.id); setShowDeleteModal(true); }}>حذف</Button>
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
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا البانر بشكل نهائي؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف البانر"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}