// src/pages/admin/ExhibitionForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const exhibitionSchema = z.object({
  title: z.string().min(3, "عنوان الفعالية مطلوب"),
  content: z.string().min(10, "التفاصيل مطلوبة (10 أحرف على الأقل)"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof exhibitionSchema>;

export default function ExhibitionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(exhibitionSchema), defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.exhibitionItem;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/exhibitions")
          .then(res => {
            const item = res.data.find((e: any) => e.id === id);
            if (item) populateForm(item);
          })
          .catch(err => console.error(err))
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("title", data.title);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); 
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/exhibitions/${id}`, formData, config);
        setMessage({ text: "تم تحديث البيانات بنجاح! جاري العودة...", variant: "success" });
      } else {
        await axiosInstance.post("/exhibitions", formData, config);
        setMessage({ text: "تم توثيق الفعالية بنجاح! جاري العودة...", variant: "success" });
      }
      setTimeout(() => { navigate('/admin/exhibitions'); }, 2000);
    } catch (error) { setMessage({ text: "حدث خطأ.", variant: "danger" }); } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'festival'}</span>
              {id ? 'تعديل بيانات الفعالية' : 'توثيق معرض أو وفد جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/exhibitions')}>عودة للقائمة</Button>
          </div>
          
          {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان الفعالية</Form.Label>
              <Form.Control type="text" placeholder="مثال: مشاركة الغرفة في معرض دمشق الدولي..." isInvalid={!!errors.title} {...register("title")} className="py-2" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">تفاصيل المشاركة (يدعم المحرر المتقدم)</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val: string) => setValue("content", val, { shouldValidate: true })} style={{ height: '300px' }} />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            <Form.Group className="mb-4 pt-3 border-top">
              <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
              <Form.Check type="switch" label="نشر في الموقع العام" {...register("isActive")} className="fw-bold text-primary fs-5" />
            </Form.Group>

            <Form.Group className="mb-5 text-center">
              <Form.Label className="fw-bold text-dark d-block mb-3">صورة الغلاف (اختياري)</Form.Label>
              <input type="file" accept="image/*" id="exhibition-upload" className="d-none" onChange={handleFileChange} />
              <label htmlFor="exhibition-upload" className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover" style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}>
                {previewUrl ? (
                  <div className="position-relative w-100">
                    <img src={previewUrl} className="rounded-3 shadow-sm border w-100" style={{ maxHeight: '250px', objectFit: 'contain' }} />
                    <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1"><span className="material-symbols-outlined fs-5">edit</span> تغيير الصورة</div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <span className="material-symbols-outlined fs-1">add_photo_alternate</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">اضغط لاختيار صورة للفعالية</h6>
                  </>
                )}
              </label>
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ والرفع...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'توثيق المشاركة'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}