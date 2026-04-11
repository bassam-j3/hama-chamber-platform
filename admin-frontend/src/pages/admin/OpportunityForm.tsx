import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';

const oppSchema = z.object({
  title: z.string().min(3, "عنوان الفرصة التجارية مطلوب"),
  content: z.string().min(10, "تفاصيل الفرصة مطلوبة"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof oppSchema>;

interface Opportunity {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function OpportunityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(oppSchema), defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  const populateForm = useCallback((data: Opportunity) => {
    setValue("title", data.title);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
  }, [setValue]);

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.oppItem as Opportunity | undefined;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/opportunities")
          .then(res => {
            const item = res.data.find((o: Opportunity) => o.id === id);
            if (item) populateForm(item);
          })
          .catch(() => {
            toast.error("فشل في تحميل بيانات الفرصة");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state, populateForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); 
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(id ? 'جاري تحديث الفرصة...' : 'جاري نشر الفرصة...');
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/opportunities/${id}`, formData, config);
        toast.success("تم التحديث بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post("/opportunities", formData, config);
        toast.success("تم النشر بنجاح!", { id: toastId });
      }
      navigate('/admin/opportunities', { replace: true });
    } catch { 
        toast.error("حدث خطأ أثناء الحفظ.", { id: toastId }); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'handshake'}</span>
              {id ? 'تعديل الفرصة التجارية' : 'إضافة فرصة تجارية جديدة'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => navigate('/admin/opportunities')}>
              عودة للقائمة
            </Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان الفرصة</Form.Label>
              <Form.Control type="text" placeholder="مثال: مناقصة توريد مواد أولية..." isInvalid={!!errors.title} {...register("title")} className="py-2" disabled={isSubmitting} id="title" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">تفاصيل وشروط الفرصة</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-expect-error ReactQuill readOnly prop type mismatch */}
                <ReactQuill readOnly={isSubmitting} theme="snow" value={editorContent || ""} onChange={(val: string) => setValue("content", val, { shouldValidate: true })} style={{ height: '300px' }} />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            <Form.Group className="mb-4 pt-3 border-top">
              <Form.Label className="fw-bold text-dark">حالة الفرصة</Form.Label>
              <Form.Check type="switch" label="متاحة للتقديم (نشطة)" {...register("isActive")} className="fw-bold text-primary fs-5" disabled={isSubmitting} id="isActive" />
            </Form.Group>

            <Form.Group className="mb-5 text-center">
              <Form.Label className="fw-bold text-dark d-block mb-3">صورة مرفقة (اختياري)</Form.Label>
              <input type="file" accept="image/*" id="opp-upload" className="d-none" onChange={handleFileChange} disabled={isSubmitting} />
              <label htmlFor="opp-upload" className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover" style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}>
                {previewUrl ? (
                  <div className="position-relative w-100">
                    <img src={previewUrl} className="rounded-3 shadow-sm border w-100" style={{ maxHeight: '250px', objectFit: 'contain' }} alt="Preview" />
                    <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1"><span className="material-symbols-outlined fs-5">edit</span> تغيير الصورة</div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <span className="material-symbols-outlined fs-1">add_photo_alternate</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">اضغط لاختيار صورة إعلانية</h6>
                  </>
                )}
              </label>
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2 rounded-pill" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'نشر الفرصة'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
