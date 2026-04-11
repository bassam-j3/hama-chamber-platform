import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table, Placeholder } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const [error, setError] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await axiosInstance.get("/banners");
      setBanners(response.data);
    } catch {
      setError("فشل في جلب البيانات من الخادم، يرجى المحاولة مرة أخرى.");
      toast.error('فشل في جلب البانرات');
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
    const toastId = toast.loading('جاري الحذف...');
    try {
      await axiosInstance.delete(`/banners/${itemToDelete}`);
      setBanners(banners.filter(b => b.id !== itemToDelete));
      setShowDeleteModal(false);
      setItemToDelete(null);
      toast.success('تم حذف البانر بنجاح', { id: toastId });
    } catch {
      toast.error('حدث خطأ أثناء الحذف', { id: toastId });
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
                  <h4 className="text-primary fw-bold mb-0">إدارة البانرات الإعلانية</h4>
                </div>
                
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/banners/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm rounded-pill py-2">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة بانر جديد
                </Button>
              </div>

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center p-5 text-danger bg-light rounded-4 border">
                  <span className="material-symbols-outlined fs-1 mb-2">error_outline</span>
                  <h5>{error}</h5>
                  <Button variant="outline-danger" size="sm" onClick={fetchBanners} className="mt-3 fw-bold px-4 rounded-pill">إعادة المحاولة</Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && banners.length === 0 && (
                <div className="text-center py-5">
                  <img src="/vite.svg" alt="No Data" style={{ width: '100px', opacity: 0.5 }} className="mb-4" />
                  <h4 className="text-muted fw-bold mb-2">لا يوجد بانرات مضافة حالياً</h4>
                  <p className="text-muted mb-4">انقر على زر الإضافة لإدراج صور إعلانية في واجهة الموقع.</p>
                  <Button variant="primary" onClick={() => navigate('/admin/banners/create')} className="px-4 fw-bold rounded-pill">
                    إضافة بانر جديد
                  </Button>
                </div>
              )}

              {/* Data Table & Skeleton Loading */}
              {(isLoading || banners.length > 0) && !error && (
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
                    {isLoading ? (
                      // Skeleton Loader
                      [...Array(5)].map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          <td>
                            <Placeholder as="div" animation="glow" className="mx-auto" style={{ width: '80px' }}>
                              <Placeholder className="rounded" style={{ width: '100%', height: '40px' }} />
                            </Placeholder>
                          </td>
                          <td className="text-start"><Placeholder as="div" animation="glow"><Placeholder xs={8} /></Placeholder></td>
                          <td><Placeholder as="div" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                          <td><Placeholder as="div" animation="glow"><Placeholder xs={6} className="rounded-pill" /></Placeholder></td>
                          <td>
                            <Placeholder as="div" animation="glow" className="d-flex justify-content-center gap-2">
                              <Placeholder.Button variant="outline-primary" xs={4} />
                              <Placeholder.Button variant="outline-danger" xs={4} />
                            </Placeholder>
                          </td>
                        </tr>
                      ))
                    ) : (
                      banners.map((banner) => (
                        <tr key={banner.id}>
                          <td>
                            <div className="rounded overflow-hidden bg-light border d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '40px' }}>
                              <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          </td>
                          <td className="fw-bold text-dark text-start">{banner.title}</td>
                          <td>{new Date(banner.createdAt).toLocaleDateString('ar-SY')}</td>
                          <td>
                            {banner.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm fw-normal">نشط</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm fw-normal">غير نشط</Badge>}
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/banners/edit/${banner.id}`, { state: { bannerItem: banner } })}>
                               <span className="material-symbols-outlined fs-6 align-middle">edit</span>
                            </Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(banner.id); setShowDeleteModal(true); }}>
                               <span className="material-symbols-outlined fs-6 align-middle">delete</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
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
          <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm rounded-pill" onClick={confirmDelete} disabled={isDeleting}>
             {isDeleting ? <Spinner size="sm" /> : "حذف البانر"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
