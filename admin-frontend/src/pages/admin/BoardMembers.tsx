import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table, Placeholder } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Member { id: string; name: string; roleTitle: string; imageUrl: string; isActive: boolean; }

export default function BoardMembers() {
  const navigate = useNavigate();
  const [data, setData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true); setError(null);
    try { 
      const response = await axiosInstance.get("/board-members"); 
      setData(response.data); 
    } 
    catch { 
      setError("فشل في جلب البيانات من الخادم، يرجى المحاولة مرة أخرى."); 
      toast.error('فشل في جلب الأعضاء');
    } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('جاري الحذف...');
    try {
      await axiosInstance.delete(`/board-members/${itemToDelete}`);
      setData(data.filter(i => i.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
      toast.success('تم الحذف بنجاح', { id: toastId });
      fetchData(); // Refetch automatically
    } catch (error) { 
      console.error(error); 
      toast.error('فشل الحذف', { id: toastId });
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
                  <span className="material-symbols-outlined text-primary fs-2">groups</span>
                  <h4 className="text-primary fw-bold mb-0">أعضاء مجلس الإدارة</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/board-members/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm rounded-pill py-2">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة عضو جديد
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
              {!isLoading && !error && data.length === 0 && (
                <div className="text-center py-5">
                  <img src="/vite.svg" alt="No Data" style={{ width: '100px', opacity: 0.5 }} className="mb-4" />
                  <h4 className="text-muted fw-bold mb-2">لا يوجد أعضاء مضافين حالياً</h4>
                  <p className="text-muted mb-4">انقر على الإضافة للبدء في تشكيل مجلس الإدارة.</p>
                  <Button variant="primary" onClick={() => navigate('/admin/board-members/create')} className="px-4 fw-bold rounded-pill">
                    إضافة العضو الأول
                  </Button>
                </div>
              )}

              {/* Data Table & Skeleton Loading */}
              {(isLoading || data.length > 0) && !error && (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace text-start">الصورة</th>
                      <th className="text-secondary font-monospace text-start">الاسم</th>
                      <th className="text-secondary font-monospace">الصفة / المنصب</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Skeleton Loader 
                      [...Array(5)].map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          <td className="text-start">
                            <Placeholder as="div" animation="glow"><Placeholder className="rounded-circle" style={{ width: '45px', height: '45px' }} /></Placeholder>
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
                      // Actual Data
                      data.map((item) => (
                        <tr key={item.id}>
                          <td className="text-start">
                            <img src={item.imageUrl || 'https://via.placeholder.com/45'} alt={item.name} className="rounded-circle object-fit-cover shadow-sm border border-2 border-white" style={{ width: '45px', height: '45px' }} />
                          </td>
                          <td className="fw-bold text-dark text-start">{item.name}</td>
                          <td>{item.roleTitle}</td>
                          <td>{item.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm fw-normal">نشط</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm fw-normal">غير نشط</Badge>}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/board-members/edit/${item.id}`, { state: { memberItem: item } })}>
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
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا العضو من المجلس؟</Modal.Body>
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