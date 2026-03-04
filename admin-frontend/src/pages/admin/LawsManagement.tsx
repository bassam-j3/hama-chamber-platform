// src/pages/admin/LawsManagement.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal, Table } from 'react-bootstrap';

const lawSchema = z.object({
  title: z.string().min(3, "عنوان القانون مطلوب"),
  content: z.string().min(5, "نص أو وصف القانون مطلوب"),
  isActive: z.boolean(),
});

type LawFormValues = z.infer<typeof lawSchema>;

interface Law {
  id: string; title: string; content: string; fileUrl: string; isActive: boolean; createdAt: string;
}

export default function LawsManagement() {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [laws, setLaws] = useState<Law[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LawFormValues>({ 
    resolver: zodResolver(lawSchema),
    defaultValues: { isActive: true }
  });

  const fetchLaws = async () => {
    setIsLoading(true);
    try { 
      const response = await axiosInstance.get("/laws"); 
      setLaws(response.data); 
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (activeView === 'list') fetchLaws(); }, [activeView]);

  const onSubmit = async (data: LawFormValues) => {
    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('file', selectedFile); 

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await axiosInstance.put(`/laws/${editingId}`, formData, config);
        setMessage({ text: "تم تحديث القانون بنجاح!", variant: "success" });
      } else {
        await axiosInstance.post("/laws", formData, config);
        setMessage({ text: "تم إضافة القانون بنجاح!", variant: "success" });
      }
      
      setTimeout(() => { 
        setMessage({ text: "", variant: "" }); 
        setActiveView('list'); 
        setEditingId(null); setSelectedFile(null); reset();
      }, 2000);
    } catch (error) {
      setMessage({ text: "حدث خطأ أثناء الاتصال بالخادم.", variant: "danger" });
    } finally { setIsSubmitting(false); }
  };

  const handleEditClick = (law: Law) => {
    setEditingId(law.id);
    setSelectedFile(null);
    reset({ title: law.title, content: law.content, isActive: law.isActive });
    setActiveView('create');
  };

  const handleDeleteClick = (id: string) => { setItemToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/laws/${itemToDelete}`);
      setLaws(laws.filter(l => l.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };
  
  const cancelDelete = () => { setShowDeleteModal(false); setItemToDelete(null); };
  
  const handleCreateNewClick = () => { 
    setEditingId(null); setSelectedFile(null);
    reset({ title: "", content: "", isActive: true }); 
    setActiveView('create'); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          {activeView === 'list' && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary fs-2">gavel</span>
                    <h4 className="text-primary fw-bold mb-0">قوانين وتشريعات</h4>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleCreateNewClick} className="fw-bold px-3 shadow-sm d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-6">add</span> إضافة قانون جديد
                  </Button>
                </div>

                {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
                : laws.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">folder_off</span><h5>لا يوجد قوانين مضافة حالياً</h5></div>) 
                : (
                  <Table responsive hover className="align-middle border-top">
                    <thead className="table-light">
                      <tr>
                        <th className="text-secondary font-monospace text-center">التاريخ</th>
                        <th className="text-secondary font-monospace">عنوان القانون</th>
                        <th className="text-secondary font-monospace text-center">المرفق</th>
                        <th className="text-secondary font-monospace text-center">الحالة</th>
                        <th className="text-secondary font-monospace text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laws.map((law) => (
                        <tr key={law.id}>
                          <td className="text-center text-muted small">{new Date(law.createdAt).toLocaleDateString('ar-SY')}</td>
                          <td className="fw-bold text-dark">{law.title}</td>
                          <td className="text-center">
                            {law.fileUrl ? <a href={law.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3">عرض المرفق</a> : <span className="text-muted">-</span>}
                          </td>
                          <td className="text-center">
                            {law.isActive ? <Badge bg="success" className="px-3 rounded-pill">منشور</Badge> : <Badge bg="secondary" className="px-3 rounded-pill">مخفي</Badge>}
                          </td>
                          <td className="text-center">
                            <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => handleEditClick(law)}>تعديل</Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => handleDeleteClick(law.id)}>حذف</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}

          {activeView === 'create' && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <h4 className="text-primary fw-bold mb-0">
                    {editingId ? 'تعديل القانون' : 'إضافة قانون جديد'}
                  </h4>
                  <Button variant="light" className="fw-bold border shadow-sm" onClick={() => setActiveView('list')}>عودة للقائمة</Button>
                </div>
                
                {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">عنوان القانون / التشريع</Form.Label>
                    <Form.Control type="text" placeholder="مثال: قانون الاستثمار رقم 18 لعام 2021..." isInvalid={!!errors.title} {...register("title")} className="py-2" />
                    <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">وصف أو نص مختصر (يظهر أسفل العنوان)</Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="للقراءة والتحميل انقر هنا..." isInvalid={!!errors.content} {...register("content")} className="py-2" />
                    <Form.Control.Feedback type="invalid">{errors.content?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
                    <Form.Check type="switch" id="custom-switch" label="نشر في الموقع العام" {...register("isActive")} className="fw-bold text-primary fs-5" />
                  </Form.Group>

                  {/* ================= التعديل الجذري للـ UX هنا ================= */}
                  <Form.Group className="mb-5 text-center">
                    <Form.Label className="fw-bold text-dark d-block mb-3">مرفق القانون (ملف أو صورة)</Form.Label>
                    
                    {/* Input مخفي تماماً */}
                    <input 
                      type="file" 
                      id="law-file-upload" 
                      className="d-none" 
                      onChange={handleFileChange} 
                    />
                    
                    {/* تصميم الـ Label الذي يعوض عن الـ Input */}
                    <label 
                      htmlFor="law-file-upload" 
                      className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-5 mx-auto transition-hover" 
                      style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}
                    >
                      {selectedFile ? (
                        // حالة وجود ملف مختار: إظهار اسم الملف بشكل جميل
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '70px', height: '70px' }}>
                            <span className="material-symbols-outlined fs-1">task</span>
                          </div>
                          <h5 className="fw-bold text-dark mb-1 text-break px-3 text-center">{selectedFile.name}</h5>
                          <Badge bg="success" className="mb-3">تم اختيار الملف بنجاح</Badge>
                          <div className="mt-2 text-primary fw-bold d-flex align-items-center justify-content-center gap-1">
                            <span className="material-symbols-outlined fs-5">edit</span> تغيير الملف
                          </div>
                        </div>
                      ) : (
                        // حالة عدم وجود ملف: إظهار أيقونة الرفع والإرشادات
                        <>
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <span className="material-symbols-outlined fs-1">upload_file</span>
                          </div>
                          <h5 className="fw-bold text-dark mb-2">اضغط هنا لاختيار الملف</h5>
                          <small className="text-muted">يدعم ملفات PDF، الوثائق (Word)، والصور (JPG, PNG)</small>
                        </>
                      )}
                    </label>
                  </Form.Group>
                  {/* ========================================================= */}

                  <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الحفظ..." : "حفظ القانون"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={cancelDelete} centered backdrop="static">
         <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-2">warning</span>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا القانون بشكل نهائي؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={cancelDelete} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف القانون"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}