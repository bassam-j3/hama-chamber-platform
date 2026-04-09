import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';

const newsSchema = z.object({
  title: z.string().min(3, "عنوان الخبر مطلوب"),
  content: z.string().min(10, "نص الخبر مطلوب"),
  isActive: z.boolean(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function NewsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Main Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Gallery State 
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NewsFormValues>({ 
    resolver: zodResolver(newsSchema), 
    defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  const populateForm = useCallback((data: { title: string; content: string; isActive: boolean; imageUrl?: string; images?: string[] }) => {
    setValue("title", data.title);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
    setExistingImages(data.images || []); 
  }, [setValue]);

  useEffect(() => {
    if (id) {
      const stateNews = location.state?.newsItem;
      if (stateNews) {
        populateForm(stateNews);
      } else {
        setIsLoading(true);
        axiosInstance.get("/news")
          .then(res => {
            const item = res.data.find((n: { id: string }) => n.id === id);
            if (item) populateForm(item);
          })
          .catch(err => {
            console.error(err);
            toast.error("فشل في تحميل بيانات الخبر");
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

  // Gallery Handlers
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NewsFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(id ? 'جاري تحديث الخبر والمعرض...' : 'جاري نشر الخبر ورفع الصور...');
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      
      if (selectedFile) formData.append('image', selectedFile);

      galleryFiles.forEach(file => formData.append('gallery', file));
      formData.append('remainingImages', JSON.stringify(existingImages));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/news/${id}`, formData, config);
        toast.success("تم تحديث الخبر بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post("/news", formData, config);
        toast.success("تم نشر الخبر بنجاح!", { id: toastId });
      }
      
      navigate('/admin/news', { replace: true });
    } catch { 
      toast.error("حدث خطأ أثناء حفظ الخبر.", { id: toastId }); 
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
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'post_add'}</span>
              {id ? 'تعديل الخبر' : 'إضافة خبر جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => navigate('/admin/news')}>
               عودة
            </Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان الخبر</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.title} {...register("title")} className="py-2" disabled={isSubmitting} />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">تفاصيل الخبر</Form.Label>
              <div style={{ direction: 'rtl' }}>
                <ReactQuill readOnly={isSubmitting} theme="snow" value={editorContent || ""} onChange={(val) => setValue("content", val, { shouldValidate: true })} style={{ height: '300px' }} />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            {/* Main Image Section */}
            <Form.Group className="mb-5 pt-4 border-top text-center">
              <Form.Label className="fw-bold text-dark d-block mb-3">الصورة الرئيسية للخبر</Form.Label>
              <input type="file" accept="image/*" id="main-upload" className="d-none" onChange={handleFileChange} disabled={isSubmitting} />
              <label htmlFor="main-upload" className="border border-2 border-primary rounded-4 p-3 d-inline-block cursor-pointer transition-hover" style={{ borderStyle: 'dashed', backgroundColor: '#f8f9fa' }}>
                {previewUrl ? (
                  <div className="position-relative">
                    <img src={previewUrl} className="rounded-3 shadow-sm" alt="Preview" style={{ maxHeight: '150px' }} />
                    <div className="mt-2 text-primary fw-bold small"><span className="material-symbols-outlined align-middle fs-6">edit</span> تغيير الغلاف</div>
                  </div>
                ) : (
                  <div className="p-4 text-muted d-flex flex-column align-items-center">
                    <span className="material-symbols-outlined fs-1 mb-2 text-primary">add_photo_alternate</span>
                    اضغط لاختيار صورة الغلاف
                  </div>
                )}
              </label>
            </Form.Group>

            {/* Gallery Section */}
            <Card className="bg-light border-0 rounded-4 mb-5">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">collections</span> معرض صور إضافي (اختياري)
                </h6>
                <input type="file" multiple accept="image/*" id="gallery-upload" className="d-none" onChange={handleGalleryChange} disabled={isSubmitting} />
                <label htmlFor="gallery-upload" className="btn btn-outline-primary btn-sm fw-bold mb-3 rounded-pill px-3">
                  <span className="material-symbols-outlined fs-6 align-middle me-1">add</span> إضافة صور للمعرض
                </label>
                
                <Row className="g-3 mt-1">
                  {existingImages.map((url, idx) => (
                    <Col key={`ex-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded shadow-sm object-fit-cover border" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeExistingGalleryImage(idx)} disabled={isSubmitting} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        <span className="material-symbols-outlined fs-6">close</span>
                      </button>
                    </Col>
                  ))}
                  {galleryPreviews.map((url, idx) => (
                    <Col key={`new-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded shadow-sm border border-2 border-primary object-fit-cover" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeNewGalleryImage(idx)} disabled={isSubmitting} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        <span className="material-symbols-outlined fs-6">close</span>
                      </button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Form.Group className="mb-4">
              <Form.Check type="switch" label="نشر فوراً (مرئي للعامة)" {...register("isActive")} className="fw-bold text-primary fs-5" disabled={isSubmitting} />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 rounded-pill fs-5" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'نشر الخبر'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}