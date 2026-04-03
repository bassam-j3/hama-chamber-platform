import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; }

export default function UsersManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true); setError(null);
    try { const response = await axiosInstance.get("/users"); setData(response.data); } 
    catch (err: any) { setError("فشل في جلب البيانات من الخادم، يرجى المحاولة مرة أخرى."); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/users/${itemToDelete}`);
      setData(data.filter(i => i.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center"><Col lg={12}><Card className="shadow-sm border-0 rounded-4"><Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div className="d-flex align-items-center gap-2"><span className="material-symbols-outlined text-primary fs-2">manage_accounts</span><h4 className="text-primary fw-bold mb-0">إدارة المستخدمين</h4></div>
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/users/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"><span className="material-symbols-outlined fs-6">add</span> إضافة مستخدم جديد</Button>
        </div>
        {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
        ) : error ? ( <div className="text-center p-5 text-danger bg-light rounded-4 border"><span className="material-symbols-outlined fs-1 mb-2">error_outline</span><h5>{error}</h5><Button variant="outline-danger" size="sm" onClick={fetchData} className="mt-3 fw-bold px-4">إعادة المحاولة</Button></div>
        ) : data.length === 0 ? ( <div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد مستخدمين مضافين حالياً</h5></div>
        ) : (
          <Table responsive hover className="align-middle text-center border-top">
            <thead className="table-light"><tr><th className="text-secondary font-monospace text-start">الاسم</th><th className="text-secondary font-monospace">البريد الإلكتروني</th><th className="text-secondary font-monospace">الصلاحية</th><th className="text-secondary font-monospace">الحالة</th><th className="text-secondary font-monospace">الإجراءات</th></tr></thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold text-dark text-start">{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role === 'ADMIN' ? <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">مدير نظام</Badge> : <Badge bg="info" className="px-3 py-2 rounded-pill shadow-sm text-dark">محرر</Badge>}</td>
                  <td>{item.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">نشط</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">موقوف</Badge>}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/users/edit/${item.id}`, { state: { userItem: item } })}>تعديل</Button>
                    <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}>إيقاف</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body></Card></Col></Row>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static"><Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center"><Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-2">warning</span>تأكيد الإيقاف</Modal.Title></Modal.Header><Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في إيقاف هذا المستخدم؟ لن يتمكن من تسجيل الدخول مجدداً.</Modal.Body><Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3"><Button variant="outline-secondary" className="fw-bold px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button><Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الإيقاف..." : "تأكيد الإيقاف"}</Button></Modal.Footer></Modal>
    </Container>
  );
}