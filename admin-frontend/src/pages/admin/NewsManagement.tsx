import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table, Placeholder } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface News { id: string; title: string; content: string; imageUrl: string; isActive: boolean; createdAt: string; }

export default function NewsManagement() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true); setError(null);
    try { 
      const response = await axiosInstance.get("/news"); 
      setNewsList(response.data); 
    } 
    catch (err: any) { 
      setError("فشل في جلب البيانات من الخادم، يرجى المحاولة مرة أخرى."); 
      toast.error('فشل في جلب الأخبار');
    } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('جاري الحذف...');
    try {
      await axiosInstance.delete(`/news/${itemToDelete}`);
      setNewsList(newsList.filter(n => n.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
      toast.success('تم حذف الخبر بنجاح', { id: toastId });
    } catch (error) { 
      console.error(error); 
      toast.error('حدث خطأ أثناء الحذف', { id: toastId });
    } finally { setIsDeleting(false); }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">newspaper</span>
                  <h4 className="text-primary fw-bold mb-0">الأخبار والنشاطات</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/news/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm rounded-pill py-2">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة خبر جديد
                </Button>
              </div>

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center p-5 text-danger bg-light rounded-4 border">
                  <span className="material-symbols-outlined fs-1 mb-2">error_outline</span>
                  <h5>{error}</h5>
                  <Button variant="outline-danger" size="sm" onClick={fetchData} className="mt-3 fw-bold px-4 rounded-pill">إعادة المحاولة</Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && newsList.length === 0 && (
                <div className="text-center py-5">
                  <img src="/vite.svg" alt="No Data" style={{ width: '100px', opacity: 0.5 }} className="mb-4" />
                  <h4 className="text-muted fw-bold mb-2">لا يوجد أخبار مضافة حالياً</h4>
                  <p className="text-muted mb-4">انقر على زر الإضافة لنشر أول خبر في الموقع.</p>
                  <Button variant="primary" onClick={() => navigate('/admin/news/create')} className="px-4 fw-bold rounded-pill">
                    إضافة خبر جديد
                  </Button>
                </div>
              )}

              {/* Data Table & Skeleton Loading */}
              {(isLoading || newsList.length > 0) && !error && (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace">صورة</th>
                      <th className="text-secondary font-monospace text-start">عنوان الخبر</th>
                      <th className="text-secondary font-monospace">تاريخ النشر</th>
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
                            <Placeholder as="div" animation="glow" className="mx-auto" style={{ width: '60px' }}>
                              <Placeholder className="rounded" style={{ width: '100%', height: '40px' }} />
                            </Placeholder>
                          </td>
                          <td className="text-start"><Placeholder as="div" animation="glow"><Placeholder xs={8} /></Placeholder></td>
                          <td><Placeholder as="div" animation="glow"><Placeholder xs={6} /></Placeholder></td>
                          <td><Placeholder as="div" animation="glow"><Placeholder xs={4} className="rounded-pill" /></Placeholder></td>
                          <td>
                            <Placeholder as="div" animation="glow" className="d-flex justify-content-center gap-2">
                              <Placeholder.Button variant="outline-primary" xs={4} />
                              <Placeholder.Button variant="outline-danger" xs={4} />
                            </Placeholder>
                          </td>
                        </tr>
                      ))
                    ) : (
                      newsList.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="rounded overflow-hidden mx-auto bg-light border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '40px' }}>
                              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="material-symbols-outlined text-muted mt-1">image</span>}
                            </div>
                          </td>
                          <td className="fw-bold text-dark text-start">{item.title}</td>
                          <td>{new Date(item.createdAt).toLocaleDateString('ar-SY')}</td>
                          <td>{item.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm fw-normal">منشور</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm fw-normal">مسودة</Badge>}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/news/edit/${item.id}`, { state: { newsItem: item } })}>
                               <span className="material-symbols-outlined fs-6 align-middle">edit</span>
                            </Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}>
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
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-2">warning</span>تأكيد الحذف
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا الخبر نهائياً؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm rounded-pill" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : "تأكيد الحذف"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}