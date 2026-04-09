import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(3, "الاسم مطلوب"),
  roleTitle: z.string().min(2, "المسمى الوظيفي مطلوب"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function BoardMemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { isActive: true }
  });

  const populateForm = useCallback((data: { name: string; roleTitle: string; isActive: boolean; imageUrl?: string }) => {
    setValue("name", data.name);
    setValue("roleTitle", data.roleTitle);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
  }, [setValue]);

  useEffect(() => {
    if (id) {
      // 🔴 الخطأ كان هنا: تم تغييره من item إلى memberItem ليطابق زر التعديل
      const stateItem = location.state?.memberItem; 
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/board-members").then(res => {
          const item = res.data.find((p: { id: string }) => p.id === id);
          if (item) populateForm(item);
        }).finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state, populateForm]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري الحفظ...');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('roleTitle', data.roleTitle);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      if (id) {
        await axiosInstance.put(`/board-members/${id}`, formData);
        toast.success('تم التحديث بنجاح!', { id: toastId });
      } else {
        await axiosInstance.post("/board-members", formData);
        toast.success('تمت الإضافة بنجاح!', { id: toastId });
      }
      navigate('/admin/board-members');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-primary fw-bold mb-0">{id ? 'تعديل العضو' : 'إضافة عضو جديد'}</h4>
            <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => navigate('/admin/board-members')}>عودة</Button>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">الاسم الثلاثي</Form.Label>
                  <Form.Control className="py-2" isInvalid={!!errors.name} {...register("name")} />
                  <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">المسمى الوظيفي (مثال: رئيس المجلس)</Form.Label>
                  <Form.Control className="py-2" isInvalid={!!errors.roleTitle} {...register("roleTitle")} />
                  <Form.Control.Feedback type="invalid">{errors.roleTitle?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-5 text-center p-4 bg-light rounded-4 border" style={{ borderStyle: 'dashed' }}>
              <Form.Label className="fw-bold d-block mb-3">الصورة الشخصية</Form.Label>
              <input type="file" accept="image/*" id="member-image" className="d-none" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
              }} />
              <label htmlFor="member-image" className="cursor-pointer">
                {previewUrl ? (
                   <img src={previewUrl} className="rounded-circle object-fit-cover shadow-sm border border-4 border-white" style={{ width: '120px', height: '120px' }} />
                ) : (
                  <div className="btn btn-outline-primary rounded-pill px-4 fw-bold">اختر صورة من جهازك</div>
                )}
              </label>
            </Form.Group>

            <Form.Check type="switch" label="عضو نشط (يظهر في الموقع)" {...register("isActive")} className="mb-4 fw-bold fs-5" />
            
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100 py-3 fw-bold rounded-pill shadow-sm fs-5">
              {isSubmitting ? <Spinner size="sm" animation="border" /> : 'حفظ البيانات'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}