import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal } from 'react-bootstrap';

const memberSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  roleTitle: z.string().min(2, "المسمى الوظيفي مطلوب"),
  isActive: z.boolean(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface BoardMember {
  id: string; name: string; roleTitle: string; imageUrl: string; isActive: boolean;
}

export default function BoardMembers() {
  const [activeView, setActiveView] = useState<'grid' | 'create'>('grid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // حالات الصورة (الملف الفعلي + رابط المعاينة البصرية)
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberFormValues>({ 
    resolver: zodResolver(memberSchema),
    defaultValues: { isActive: true }
  });

  const fetchMembers = async () => {
    setIsLoading(true);
    try { 
      const response = await axiosInstance.get("/board-members"); 
      setMembers(response.data); 
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (activeView === 'grid') fetchMembers(); }, [activeView]);

  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('roleTitle', data.roleTitle);
      formData.append('isActive', data.isActive.toString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await axiosInstance.put(`/board-members/${editingId}`, formData, config);
        setMessage({ text: "تم تحديث بيانات العضو بنجاح!", variant: "success" });
      } else {
        await axiosInstance.post("/board-members", formData, config);
        setMessage({ text: "تمت إضافة العضو بنجاح!", variant: "success" });
      }
      
      setTimeout(() => { 
        setMessage({ text: "", variant: "" }); 
        setActiveView('grid'); 
        setEditingId(null); 
        setSelectedImage(null); 
        setPreviewUrl(null); // تفريغ المعاينة
        reset();
      }, 2000);
    } catch (error) {
      setMessage({ text: "حدث خطأ أثناء الاتصال بالخادم.", variant: "danger" });
    } finally { setIsSubmitting(false); }
  };

  const handleEditClick = (member: BoardMember) => {
    setEditingId(member.id);
    setSelectedImage(null);
    setPreviewUrl(member.imageUrl || null); // عرض الصورة القديمة عند التعديل
    reset({ name: member.name, roleTitle: member.roleTitle, isActive: member.isActive });
    setActiveView('create');
  };

  const handleDeleteClick = (id: string) => { setMemberToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/board-members/${memberToDelete}`);
      setMembers(members.filter(m => m.id !== memberToDelete));
      setShowDeleteModal(false); setMemberToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };
  
  const cancelDelete = () => { setShowDeleteModal(false); setMemberToDelete(null); };
  
  const handleCreateNewClick = () => { 
    setEditingId(null); 
    setSelectedImage(null);
    setPreviewUrl(null); // تفريغ المعاينة للإضافة الجديدة
    reset({ name: "", roleTitle: "", isActive: true }); 
    setActiveView('create'); 
  };

  // التقاط الصورة وتوليد رابط معاينة مؤقت
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // إنشاء رابط محلي لمعاينة الصورة
    }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          
          {/* ----- شاشة عرض البطاقات ----- */}
          {activeView === 'grid' && (
            <div className="bg-white p-4 rounded-4 shadow-sm border-0">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <h4 className="text-primary fw-bold mb-0">أعضاء مجلس الإدارة</h4>
                <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleCreateNewClick}>
                  + إضافة عضو جديد
                </Button>
              </div>

              {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
              : members.length === 0 ? (<div className="text-center p-5 text-muted"><h5>لا يوجد أعضاء مضافين حالياً</h5></div>) 
              : (
                <Row className="g-4">
                  {members.map((member) => (
                    <Col md={6} lg={4} xl={3} key={member.id}>
                      <Card className="h-100 text-center shadow-sm rounded-4 border-light transition-hover">
                        <div className="mx-auto mt-4 rounded-circle border border-2 border-primary d-flex justify-content-center align-items-center overflow-hidden shadow-sm" style={{width: '120px', height: '120px', backgroundColor: '#f6f8f8'}}>
                        {member.imageUrl ? (
                              <img 
                                src={member.imageUrl} 
                                alt={member.name} 
                                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                // هذه الدالة السحرية تخفي الصورة المكسورة وتضع الأيقونة الافتراضية بدلاً منها
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="material-symbols-outlined text-muted" style="font-size: 50px;">person</span>');
                                }}
                              />
                            ) : (
                              <span className="material-symbols-outlined text-muted" style={{fontSize: '50px'}}>person</span>
                            )}                     
                               </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="fw-bold text-dark mt-2 mb-1">{member.name}</Card.Title>
                          <Card.Text className="text-muted small mb-4">{member.roleTitle}</Card.Text>
                          <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                            <div className="d-flex gap-2">
                              <Button variant="outline-danger" size="sm" className="d-flex align-items-center p-1" onClick={() => handleDeleteClick(member.id)}>
                                <span className="material-symbols-outlined fs-6">delete</span>
                              </Button>
                              <Button variant="outline-primary" size="sm" className="d-flex align-items-center p-1" onClick={() => handleEditClick(member)}>
                                <span className="material-symbols-outlined fs-6">edit</span>
                              </Button>
                            </div>
                            <Badge bg={member.isActive ? "success" : "secondary"} className="px-3 py-2 rounded-2 shadow-sm bg-opacity-25 text-success border border-success">
                              {member.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {/* ----- شاشة الإضافة والتعديل ----- */}
          {activeView === 'create' && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <h4 className="text-primary fw-bold mb-0">
                    {editingId ? 'تعديل بيانات العضو' : 'إضافة عضو مجلس إدارة'}
                  </h4>
                  <Button variant="light" className="fw-bold border shadow-sm" onClick={() => setActiveView('grid')}>عودة للقائمة</Button>
                </div>
                
                {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark">الاسم الكامل</Form.Label>
                        <Form.Control type="text" isInvalid={!!errors.name} {...register("name")} className="py-2" />
                        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark">المسمى الوظيفي</Form.Label>
                        <Form.Control type="text" placeholder="مثال: رئيس الغرفة..." isInvalid={!!errors.roleTitle} {...register("roleTitle")} className="py-2" />
                        <Form.Control.Feedback type="invalid">{errors.roleTitle?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark">حالة العضو</Form.Label>
                    <Form.Check 
                      type="switch"
                      id="custom-switch"
                      label="نشط (يظهر في الموقع)"
                      {...register("isActive")}
                      className="fw-bold text-primary fs-5"
                    />
                  </Form.Group>

                  {/* منطقة رفع الصورة المصممة (UI Upload Zone) */}
                  <Form.Group className="mb-5 text-center">
                    <Form.Label className="fw-bold text-dark d-block mb-3">الصورة الشخصية للعضو</Form.Label>
                    
                    {/* الحقل الفعلي مخفي، نستخدم الـ label كتصميم واجهة */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="image-upload" 
                      className="d-none" 
                      onChange={handleImageChange} 
                    />
                    
                    <label 
                      htmlFor="image-upload" 
                      className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover"
                      style={{ maxWidth: '400px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}
                    >
                      {previewUrl ? (
                        // حالة وجود صورة (معاينة)
                        <div className="position-relative">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="rounded-circle shadow-sm border border-white border-3" 
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                          />
                          <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1">
                            <span className="material-symbols-outlined fs-5">edit</span> تغيير الصورة
                          </div>
                        </div>
                      ) : (
                        // حالة عدم وجود صورة
                        <>
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <span className="material-symbols-outlined fs-1">add_a_photo</span>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">اضغط هنا لاختيار صورة</h6>
                          <small className="text-muted d-block mt-2">يفضل استخدام صور بخلفية بيضاء وبأبعاد مربعة.</small>
                        </>
                      )}
                    </label>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الحفظ والرفع..." : "حفظ بيانات العضو"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={cancelDelete} centered backdrop="static">
        <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-2">warning</span>تأكيد إجراء الحذف
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">
          هل أنت متأكد من رغبتك في حذف هذا العضو بشكل نهائي؟ 
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={cancelDelete} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? "جاري الحذف..." : "حذف العضو"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}