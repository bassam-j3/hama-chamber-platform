import { useState, useEffect } from "react";
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

  // Gallery State (Phase 2)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NewsFormValues>({ 
    resolver: zodResolver(newsSchema), 
    defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  useEffect(() => {
    if (id) {
      const stateNews = location.state?.newsItem;
      if (stateNews) {
        populateForm(stateNews);
      } else {
        setIsLoading(true);
        axiosInstance.get("/news")
          .then(res => {
            const item = res.data.find((n: any) => n.id === id);
            if (item) populateForm(item);
          })
          .catch(err => {
            console.error(err);
            toast.error("فشل في تحميل بيانات الخبر");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("title", data.title);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
    setExistingImages(data.images || []); // Load gallery from DB
  };

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
    const toastId = toast.loading('جاري حفظ الخبر والمعرض...');
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      
      if (selectedFile) formData.append('image', selectedFile);

      // Append new gallery files
      galleryFiles.forEach(file => formData.append('gallery', file));
      
      // Send remaining existing images (for deletion sync)
      formData.append('remainingImages', JSON.stringify(existingImages));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/news/${id}`, formData, config);
        toast.success("تم تحديث الخبر بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post("/news", formData, config);
        toast.success("تم نشر الخبر بنجاح!", { id: toastId });
      }
      
      navigate('/admin/news');
    } catch (error) { 
      toast.error("حدث خطأ أثناء حفظ الخبر.", { id: toastId }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{id ? 'edit_document' : 'post_add'}</span>
              {id ? 'تعديل الخبر' : 'إضافة خبر جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/news')}>عودة</Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">عنوان الخبر</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.title} {...register("title")} className="py-2" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold">تفاصيل الخبر</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val) => setValue("content", val)} style={{ height: '300px' }} />
              </div>
            </Form.Group>

            {/* Main Image Section */}
            <Form.Group className="mb-5 pt-4 border-top text-center">
              <Form.Label className="fw-bold d-block mb-3">الصورة الرئيسية للخبر</Form.Label>
              <input type="file" accept="image/*" id="main-upload" className="d-none" onChange={handleFileChange} />
              <label htmlFor="main-upload" className="border border-2 border-primary rounded-4 p-3 d-inline-block cursor-pointer" style={{ borderStyle: 'dashed' }}>
                {previewUrl ? <img src={previewUrl} className="rounded-3" style={{ maxHeight: '150px' }} /> : <div className="p-4 text-muted">اضغط لاختيار صورة الغلاف</div>}
              </label>
            </Form.Group>

            {/* Gallery Section (Phase 2) */}
            <Card className="bg-light border-0 rounded-4 mb-5">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">collections</span> معرض صور إضافي (اختياري)
                </h6>
                <input type="file" multiple accept="image/*" id="gallery-upload" className="d-none" onChange={handleGalleryChange} />
                <label htmlFor="gallery-upload" className="btn btn-outline-primary btn-sm fw-bold mb-3">إضافة صور للمعرض</label>
                
                <Row className="g-2">
                  {existingImages.map((url, idx) => (
                    <Col key={`ex-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded shadow-sm object-fit-cover" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeExistingGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle">×</button>
                    </Col>
                  ))}
                  {galleryPreviews.map((url, idx) => (
                    <Col key={`new-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded shadow-sm border border-primary object-fit-cover" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeNewGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle">×</button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Form.Group className="mb-4">
              <Form.Check type="switch" label="نشر فوراً" {...register("isActive")} className="fw-bold" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" animation="border" /> : <><span className="material-symbols-outlined">save</span> حفظ الخبر</>}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}