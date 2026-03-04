// src/pages/admin/CircularsManagement.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal, Table } from 'react-bootstrap';

// مخطط التحقق (Validation Schema)
const circularSchema = z.object({
  title: z.string().min(3, "عنوان التعميم مطلوب"),
  content: z.string().min(5, "نص التعميم مطلوب"),
  category: z.string().min(2, "التصنيف مطلوب"),
  isActive: z.boolean(),
});

type CircularFormValues = z.infer<typeof circularSchema>;

interface Circular {
  id: string; title: string; content: string; category: string; imageUrl: string; isActive: boolean; createdAt: string;
}

export default function CircularsManagement() {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // التعامل مع الملفات
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CircularFormValues>({ 
    resolver: zodResolver(circularSchema),
    defaultValues: { isActive: true, category: "تعاميم عامة" }
  });

  const fetchCirculars = async () => {
    setIsLoading(true);
    try { 
      const response = await axiosInstance.get("/circulars"); 
      setCirculars(response.data); 
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (activeView === 'list') fetchCirculars(); }, [activeView]);

  const onSubmit = async (data: CircularFormValues) => {
    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await axiosInstance.put(`/circulars/${editingId}`, formData, config);
        setMessage({ text: "تم تحديث التعميم بنجاح!", variant: "success" });
      } else {
        await axiosInstance.post("/circulars", formData, config);
        setMessage({ text: "تم نشر التعميم بنجاح!", variant: "success" });
      }
      
      setTimeout(() => { 
        setMessage({ text: "", variant: "" }); 
        setActiveView('list'); 
        setEditingId(null); setSelectedFile(null); setPreviewUrl(null); reset();
      }, 2000);
    } catch (error) {
      setMessage({ text: "حدث خطأ أثناء الاتصال بالخادم.", variant: "danger" });
    } finally { setIsSubmitting(false); }
  };

  const handleEditClick = (circular: Circular) => {
    setEditingId(circular.id);
    setSelectedFile(null);
    setPreviewUrl(circular.imageUrl || null);
    reset({ title: circular.title, content: circular.content, category: circular.category, isActive: circular.isActive });
    setActiveView('create');
  };

  const handleDeleteClick = (id: string) => { setItemToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/circulars/${itemToDelete}`);
      setCirculars(circulars.filter(c => c.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };
  
  const cancelDelete = () => { setShowDeleteModal(false); setItemToDelete(null); };
  
  const handleCreateNewClick = () => { 
    setEditingId(null); setSelectedFile(null); setPreviewUrl(null);
    reset({ title: "", content: "", category: "تعاميم عامة", isActive: true }); 
    setActiveView('create'); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          
          {/* ----- شاشة عرض التعاميم (جدول) ----- */}
          {activeView === 'list' && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary fs-2">assignment</span>
                    <h4 className="text-primary fw-bold mb-0">التعاميم والقرارات</h4>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleCreateNewClick} className="fw-bold px-3 shadow-sm d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-6">add</span> إضافة تعميم جديد
                  </Button>
                </div>

                {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
                : circulars.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">folder_off</span><h5>لا يوجد تعاميم مضافة حالياً</h5></div>) 
                : (
                  <Table responsive hover className="align-middle border-top">
                    <thead className="table-light">
                      <tr>
                        <th className="text-secondary font-monospace text-center">التاريخ</th>
                        <th className="text-secondary font-monospace">عنوان التعميم</th>
                        <th className="text-secondary font-monospace text-center">التصنيف</th>
                        <th className="text-secondary font-monospace text-center">المرفق</th>
                        <th className="text-secondary font-monospace text-center">الحالة</th>
                        <th className="text-secondary font-monospace text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {circulars.map((circular) => (
                        <tr key={circular.id}>
                          <td className="text-center text-muted small">{new Date(circular.createdAt).toLocaleDateString('ar-SY')}</td>
                          <td className="fw-bold text-dark">{circular.title}</td>
                          <td className="text-center"><Badge bg="info" className="text-dark bg-opacity-25 border border-info px-2">{circular.category}</Badge></td>
                          <td className="text-center">
                            {circular.imageUrl ? <span className="material-symbols-outlined text-success fs-5">description</span> : <span className="text-muted">-</span>}
                          </td>
                          <td className="text-center">
                            {circular.isActive ? <Badge bg="success" className="px-3 rounded-pill">منشور</Badge> : <Badge bg="secondary" className="px-3 rounded-pill">مخفي</Badge>}
                          </td>
                          <td className="text-center">
                            <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => handleEditClick(circular)}>تعديل</Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => handleDeleteClick(circular.id)}>حذف</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}

          {/* ----- شاشة الإضافة والتعديل ----- */}
          {activeView === 'create' && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <h4 className="text-primary fw-bold mb-0">
                    {editingId ? 'تعديل التعميم' : 'إضافة تعميم جديد'}
                  </h4>
                  <Button variant="light" className="fw-bold border shadow-sm" onClick={() => setActiveView('list')}>عودة للقائمة</Button>
                </div>
                
                {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col md={8}>
                       <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark">عنوان التعميم</Form.Label>
                        <Form.Control type="text" placeholder="مثال: تعميم بخصوص العطلة الرسمية..." isInvalid={!!errors.title} {...register("title")} className="py-2" />
                        <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark">التصنيف</Form.Label>
                        <Form.Select {...register("category")} className="py-2" isInvalid={!!errors.category}>
                          <option value="تعاميم عامة">تعاميم عامة</option>
                          <option value="وزارة الاقتصاد">وزارة الاقتصاد</option>
                          <option value="وزارة المالية">وزارة المالية</option>
                          <option value="قرارات إدارية">قرارات إدارية</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">نص التعميم / القرار</Form.Label>
                    <Form.Control as="textarea" rows={6} placeholder="اكتب تفاصيل القرار هنا..." isInvalid={!!errors.content} {...register("content")} className="py-2" />
                    <Form.Control.Feedback type="invalid">{errors.content?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
                    <Form.Check type="switch" id="custom-switch" label="نشر فوراً" {...register("isActive")} className="fw-bold text-primary fs-5" />
                  </Form.Group>

                  <Form.Group className="mb-5 text-center">
                    <Form.Label className="fw-bold text-dark d-block mb-3">صورة ضوئية للقرار (اختياري)</Form.Label>
                    <input type="file" accept="image/*" id="file-upload" className="d-none" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover" style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}>
                      {previewUrl ? (
                        <div className="position-relative w-100">
                          <img src={previewUrl} alt="Preview" className="rounded-3 shadow-sm border border-white border-3 w-100" style={{ maxHeight: '200px', objectFit: 'contain' }} />
                          <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1"><span className="material-symbols-outlined fs-5">edit</span> تغيير المرفق</div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '60px', height: '60px' }}>
                            <span className="material-symbols-outlined fs-2">attach_file</span>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">إرفاق صورة القرار (Scan)</h6>
                        </>
                      )}
                    </label>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الحفظ..." : "حفظ ونشر التعميم"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={cancelDelete} centered backdrop="static">
         {/* ... (نفس مودال الحذف السابق) ... */}
         <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-2">warning</span>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا التعميم؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={cancelDelete} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}