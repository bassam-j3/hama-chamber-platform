// src/pages/admin/BannerForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const bannerSchema = z.object({
  title: z.string().min(3, "عنوان البانر مطلوب"),
  link: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof bannerSchema>;

export default function BannerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true, link: "" }
  });

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.bannerItem;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/banners")
          .then(res => {
            const item = res.data.find((b: any) => b.id === id);
            if (item) populateForm(item);
          })
          .catch(err => console.error(err))
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("title", data.title);
    setValue("link", data.link || "");
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedFile && !id) {
        setMessage({ text: "الرجاء اختيار صورة للبانر.", variant: "danger" });
        return;
    }

    setIsSubmitting(true); setMessage({ text: "", variant: "" });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('link', data.link || '');
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/banners/${id}`, formData, config);
        setMessage({ text: "تم تحديث البانر بنجاح! جاري العودة...", variant: "success" });
      } else {
        await axiosInstance.post("/banners", formData, config);
        setMessage({ text: "تمت إضافة البانر بنجاح! جاري العودة...", variant: "success" });
      }
      
      setTimeout(() => { navigate('/admin/banners'); }, 2000);
      
    } catch (error) { 
      setMessage({ text: "حدث خطأ أثناء حفظ البانر.", variant: "danger" }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'post_add'}</span>
              {id ? 'تعديل البانر' : 'إضافة بانر جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/banners')}>
              عودة للقائمة
            </Button>
          </div>
          
          {message.text && <Alert variant={message.variant} className="fw-bold shadow-sm">{message.text}</Alert>}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان البانر</Form.Label>
              <Form.Control type="text" placeholder="اكتب عنواناً للبانر..." isInvalid={!!errors.title} {...register("title")} className="py-2" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="fw-bold text-dark">الرابط (اختياري)</Form.Label>
                <Form.Control type="text" placeholder="مثال: https://hamachamber.com/news/1" isInvalid={!!errors.link} {...register("link")} className="py-2" />
                <Form.Control.Feedback type="invalid">{errors.link?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4 pt-3 border-top">
              <Form.Label className="fw-bold text-dark">حالة البانر</Form.Label>
              <Form.Check type="switch" id="banner-active-switch" label="نشط (يعرض في الصفحة الرئيسية)" {...register("isActive")} className="fw-bold text-primary fs-5" />
            </Form.Group>

            <Form.Group className="mb-5 text-center">
              <Form.Label className="fw-bold text-dark d-block mb-3">صورة البانر</Form.Label>
              <input type="file" accept="image/*" id="banner-upload" className="d-none" onChange={handleFileChange} />
              <label htmlFor="banner-upload" className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover" style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}>
                {previewUrl ? (
                  <div className="position-relative w-100">
                    <img src={previewUrl} alt="Preview" className="rounded-3 shadow-sm border border-white border-3 w-100" style={{ maxHeight: '250px', objectFit: 'contain' }} />
                    <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1"><span className="material-symbols-outlined fs-5">edit</span> تغيير الصورة</div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <span className="material-symbols-outlined fs-1">add_photo_alternate</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">اضغط لاختيار صورة للبانر</h6>
                    <small className="text-muted">الأبعاد المفضلة: 1920x1080 بكسل</small>
                  </>
                )}
              </label>
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ والرفع...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'إضافة البانر'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}