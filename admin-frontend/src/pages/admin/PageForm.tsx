// src/pages/admin/PageForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Container, Card, Form, Button, Alert, Spinner, InputGroup, Row, Col } from 'react-bootstrap'; // تمت إضافة Row و Col
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ملاحظة: تأكد من مسار axiosInstance لديك
import axiosInstance from "../../api/axiosInstance";

const pageSchema = z.object({
  title: z.string().min(3, "عنوان الصفحة مطلوب"),
  slug: z.string().min(2, "الرابط مطلوب").regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات (-) فقط"),
  content: z.string().min(10, "محتوى الصفحة مطلوب"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof pageSchema>;

export default function PageForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(pageSchema), defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.pageItem;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/pages")
          .then((res: any) => { // تم إصلاح الخطأ هنا
            const item = res.data.find((p: any) => p.id === id);
            if (item) populateForm(item);
          })
          .catch((err: any) => console.error(err)) // تم إصلاح الخطأ هنا
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("title", data.title);
    setValue("slug", data.slug);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      if (id) {
        await axiosInstance.put(`/pages/${id}`, data);
        setMessage({ text: "تم تحديث الصفحة بنجاح!", variant: "success" });
      } else {
        await axiosInstance.post("/pages", data);
        setMessage({ text: "تم نشر الصفحة بنجاح!", variant: "success" });
      }
      setTimeout(() => { navigate('/admin/pages'); }, 2000);
    } catch (error: any) { 
      if(error.response?.data?.message?.includes('Unique constraint')) {
        setMessage({ text: "هذا الرابط (Slug) مستخدم لصفحة أخرى، يرجى تغييره.", variant: "danger" });
      } else {
        setMessage({ text: "حدث خطأ أثناء الحفظ.", variant: "danger" }); 
      }
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'post_add'}</span>
              {id ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/pages')}>عودة للقائمة</Button>
          </div>
          
          {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">عنوان الصفحة (يظهر للزوار)</Form.Label>
                  <Form.Control type="text" placeholder="مثال: من نحن، رؤيتنا، اتصل بنا..." isInvalid={!!errors.title} {...register("title")} className="py-2 fw-bold" />
                  <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">الرابط المخصص (Slug)</Form.Label>
                  <InputGroup hasValidation dir="ltr">
                    <InputGroup.Text id="basic-addon1">/page/</InputGroup.Text>
                    <Form.Control type="text" placeholder="about-us" isInvalid={!!errors.slug} {...register("slug")} className="py-2" aria-describedby="basic-addon1" />
                    <Form.Control.Feedback type="invalid">{errors.slug?.message}</Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted small text-end d-block mt-1">يجب أن يكون باللغة الإنجليزية وبدون مسافات (استخدم - بدلاً من المسافة).</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">محتوى الصفحة</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val: string) => setValue("content", val, { shouldValidate: true })} style={{ height: '400px' }} />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            <Form.Group className="mb-5 pt-4 border-top">
              <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
              <Form.Check type="switch" label="نشر الصفحة (متاحة للزوار)" {...register("isActive")} className="fw-bold text-primary fs-5" />
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'نشر الصفحة'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}