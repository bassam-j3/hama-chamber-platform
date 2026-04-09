import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Container, Card, Form, Button, Spinner, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { QRCodeSVG } from 'qrcode.react'; 
import axiosInstance from "../../api/axiosInstance";
import toast from 'react-hot-toast';

const pageSchema = z.object({
  title: z.string().min(3, "عنوان الصفحة مطلوب"),
  slug: z.string().min(2, "الرابط مطلوب").regex(/^[a-z0-9\u0600-\u06FF-]+$/, "الرابط يجب أن يحتوي على أحرف إنجليزية أو عربية وأرقام وشرطات (-) فقط"),
  content: z.string().min(10, "محتوى الصفحة مطلوب"),
  isActive: z.boolean(),
  isSecure: z.boolean(),
});

type FormValues = z.infer<typeof pageSchema>;

export default function PageForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [savedPageData, setSavedPageData] = useState<{slug: string, title: string} | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(pageSchema), defaultValues: { isActive: true, isSecure: false, content: "" }
  });
  
  const editorContent = watch("content");
  const titleValue = watch("title"); 

  useEffect(() => {
    if (!id && titleValue) {
      const generatedSlug = titleValue.trim().replace(/[\s_]+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, ''); 
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, id, setValue]);

  const populateForm = useCallback((data: { title: string; slug: string; content: string; isActive: boolean; isSecure?: boolean }) => {
    setValue("title", data.title);
    setValue("slug", data.slug);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setValue("isSecure", data.isSecure || false);
  }, [setValue]);

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.pageItem;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/pages")
          .then((res: { data: Array<{ id: string; title: string; slug: string; content: string; isActive: boolean; isSecure?: boolean }> }) => { 
            const item = res.data.find((p) => p.id === id);
            if (item) populateForm(item);
          })
          .catch(() => {
              toast.error("فشل تحميل بيانات الصفحة");
          }) 
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state, populateForm]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ الصفحة...');

    try {
      if (id) {
        await axiosInstance.put(`/pages/${id}`, data);
        toast.success("تم تحديث الصفحة بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post("/pages", data);
        toast.success("تم نشر الصفحة بنجاح!", { id: toastId });
      }

      if (data.isSecure) {
        setSavedPageData({ slug: data.slug, title: data.title });
        setShowQrModal(true); 
      } else {
        navigate('/admin/pages');
      }

    } catch (err: unknown) { 
      const error = err as { response?: { data?: { message?: string } } };
      if(error.response?.data?.message?.includes('Unique constraint')) {
        toast.error("هذا الرابط (Slug) مستخدم لصفحة أخرى، يرجى تغييره.", { id: toastId });
      } else {
        toast.error("حدث خطأ أثناء الحفظ.", { id: toastId }); 
      }
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const handlePrintQR = () => {
    const printContent = qrRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة QR Code - ${savedPageData?.title}</title>
            <style>body { font-family: sans-serif; text-align: center; padding-top: 50px; } h1 { color: #0a4d44; margin-bottom: 20px; }</style>
          </head>
          <body>
            <h1>${savedPageData?.title}</h1>
            ${printContent}
            <p style="margin-top: 20px; color: #666;">قم بمسح الرمز للوصول الآمن للصفحة</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const secureUrl = savedPageData ? `${window.location.origin}/page/${savedPageData.slug}?passcode=HAMA2026` : '';

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
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">عنوان الصفحة</Form.Label>
                  <Form.Control type="text" placeholder="مثال: عن الغرفة..." isInvalid={!!errors.title} {...register("title")} className="py-2 fw-bold" />
                  <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">الرابط المخصص (Slug)</Form.Label>
                  <InputGroup hasValidation dir="ltr">
                    <InputGroup.Text id="basic-addon1">/page/</InputGroup.Text>
                    <Form.Control type="text" isInvalid={!!errors.slug} {...register("slug")} className="py-2 fw-bold text-primary" />
                    <Form.Control.Feedback type="invalid">{errors.slug?.message}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">محتوى الصفحة</Form.Label>
              <div style={{ direction: 'rtl' }}>
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val: string) => setValue("content", val, { shouldValidate: true })} style={{ height: '400px' }} />
              </div>
            </Form.Group>

            <Row className="mb-5 pt-4 border-top">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark">حالة الظهور</Form.Label>
                  <Form.Check type="switch" label="نشر الصفحة (متاحة)" {...register("isActive")} className="fw-bold text-success fs-5" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark">مستوى الأمان</Form.Label>
                  <Form.Check type="switch" label="صفحة محمية (تتطلب QR Code)" {...register("isSecure")} className="fw-bold text-danger fs-5" />
                  <Form.Text className="text-muted small">إذا قمت بتفعيل هذا الخيار، لن تفتح الصفحة إلا بمسح الـ QR.</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" animation="border" /> جاري الحفظ...</> : <><span className="material-symbols-outlined">save</span> حفظ الصفحة</>}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showQrModal} onHide={() => { setShowQrModal(false); navigate('/admin/pages'); }} centered backdrop="static">
        <Modal.Header className="border-0 bg-primary text-white d-flex justify-content-between align-items-center">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">qr_code_scanner</span> الصفحة محمية وجاهزة!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <h5 className="fw-bold text-dark mb-4">{savedPageData?.title}</h5>
          <div ref={qrRef} className="d-inline-block p-3 bg-white border rounded-4 shadow-sm mb-4">
             <QRCodeSVG value={secureUrl} size={200} level="H" includeMargin={true} />
          </div>
          <p className="text-muted small px-4">تم تشفير الرابط. اطبع هذا الرمز لتمكين الزوار من الدخول.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light d-flex justify-content-between">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={() => navigate('/admin/pages')}>إغلاق</Button>
          <Button variant="primary" className="fw-bold px-4 d-flex align-items-center gap-2" onClick={handlePrintQR}>
            <span className="material-symbols-outlined">print</span> طباعة الرمز
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}