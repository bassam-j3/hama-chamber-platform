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

const projectSchema = z.object({
  title: z.string().min(3, "عنوان المشروع يجب أن يكون 3 أحرف على الأقل"),
  content: z.string().min(10, "تفاصيل المشروع يجب أن تكون 10 أحرف على الأقل"),
  isActive: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({ 
    resolver: zodResolver(projectSchema),
    defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  const populateForm = useCallback((data: { title: string; content: string; isActive: boolean; imageUrl?: string; images?: string[] }) => {
    setValue("title", data.title);
    setValue("content", data.content);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
    setExistingImages(data.images || []);
    setFileType(data.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');
  }, [setValue]);

  useEffect(() => {
    if (id) {
      const stateProject = location.state?.projectItem;
      if (stateProject) {
        populateForm(stateProject);
      } else {
        setIsLoading(true);
        axiosInstance.get("/projects")
          .then(res => {
            const item = res.data.find((p: { id: string }) => p.id === id);
            if (item) populateForm(item);
            else toast.error("المشروع غير موجود");
          })
          .catch(() => {
            toast.error("فشل في تحميل بيانات المشروع");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state, populateForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video') ? 'video' : 'image');
    }
  };

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

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(id ? 'جاري تحديث المشروع...' : 'جاري إضافة المشروع الجديد...');
    
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
        await axiosInstance.put(`/projects/${id}`, formData, config);
        toast.success('تم تحديث المشروع بنجاح! 🎉', { id: toastId });
      } else {
        await axiosInstance.post("/projects", formData, config);
        toast.success('تمت إضافة المشروع بنجاح! 🚀', { id: toastId });
      }
      navigate('/admin/projects');
    } catch { 
      toast.error('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً', { id: toastId }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) return (
    <div className="text-center p-5 mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-primary fw-bold">جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <Container fluid className="max-w-75 mb-5" dir="rtl">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined">{id ? 'edit_square' : 'add_business'}</span>
                {id ? 'تعديل بيانات المشروع' : 'إضافة مشروع تنموي جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => navigate('/admin/projects')}>
                عودة للقائمة
            </Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان المشروع</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="أدخل عنواناً واضحاً للمشروع..."
                isInvalid={!!errors.title} 
                {...register("title")} 
                className="py-2 rounded-3 border-light bg-light bg-opacity-50" 
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">تفاصيل المشروع (محرر متقدم)</Form.Label>
              <div style={{ direction: 'rtl' }}>
                <ReactQuill 
                    theme="snow" 
                    value={editorContent || ""} 
                    readOnly={isSubmitting}
                    onChange={(val) => setValue("content", val, { shouldValidate: true })} 
                    style={{ height: '300px' }} 
                />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            <Form.Group className="mb-5 pt-4 border-top text-center">
              <Form.Label className="fw-bold d-block mb-3 text-dark">الغلاف الرئيسي للمشروع</Form.Label>
              <input type="file" accept="image/*,video/*" id="project-main" className="d-none" onChange={handleFileChange} disabled={isSubmitting} />
              <label htmlFor="project-main" className="border border-2 border-primary rounded-4 p-3 d-inline-block cursor-pointer transition-all hover-bg-light" style={{ borderStyle: 'dashed', maxWidth: '100%' }}>
                {previewUrl ? (
                  <div className="position-relative">
                    {fileType === 'video' ? (
                        <video src={previewUrl} style={{maxHeight:'200px', maxWidth:'100%'}} controls className="rounded shadow-sm" />
                    ) : (
                        <img src={previewUrl} style={{maxHeight:'200px', maxWidth:'100%'}} className="rounded shadow-sm" />
                    )}
                    <div className="mt-2 text-primary fw-bold small">اضغط لتغيير الغلاف</div>
                  </div>
                ) : (
                    <div className="p-4 d-flex flex-column align-items-center gap-2 text-muted">
                        <span className="material-symbols-outlined fs-1">add_a_photo</span>
                        <span className="fw-bold">اختر صورة أو فيديو للغلاف</span>
                    </div>
                )}
              </label>
            </Form.Group>

            <Card className="bg-light border-0 rounded-4 mb-5 shadow-inner">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2 border-bottom pb-2">
                   <span className="material-symbols-outlined text-primary">collections</span> معرض الصور الإضافية
                </h6>
                <input type="file" multiple accept="image/*" id="gallery-proj" className="d-none" onChange={handleGalleryChange} disabled={isSubmitting} />
                <label htmlFor="gallery-proj" className="btn btn-primary rounded-pill px-4 fw-bold mb-4 shadow-sm d-inline-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-5">upload_file</span> إضافة صور للمعرض
                </label>
                
                <Row className="g-3">
                  {existingImages.map((url, idx) => (
                    <Col key={`ex-${idx}`} xs={6} sm={4} md={3} lg={2} className="position-relative">
                      <div className="ratio ratio-1x1 rounded overflow-hidden shadow-sm border bg-white">
                        <img src={url} className="object-fit-cover" />
                      </div>
                      <button type="button" onClick={() => removeExistingGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-2 rounded-circle shadow-sm" disabled={isSubmitting}>×</button>
                    </Col>
                  ))}
                  {galleryPreviews.map((url, idx) => (
                    <Col key={`new-${idx}`} xs={6} sm={4} md={3} lg={2} className="position-relative">
                      <div className="ratio ratio-1x1 rounded overflow-hidden shadow-sm border border-primary border-2 bg-white">
                        <img src={url} className="object-fit-cover" />
                      </div>
                      <button type="button" onClick={() => removeNewGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-2 rounded-circle shadow-sm" disabled={isSubmitting}>×</button>
                    </Col>
                  ))}
                  {existingImages.length === 0 && galleryPreviews.length === 0 && (
                      <Col xs={12} className="text-center py-4 text-muted">
                          <p className="mb-0 small fw-bold">لم يتم اختيار أي صور إضافية بعد</p>
                      </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <div className="bg-white p-3 rounded-4 border mb-4 shadow-sm">
                <Form.Check 
                    type="switch" 
                    id="active-switch"
                    label="تفعيل المشروع ونشره للعامة فوراً" 
                    {...register("isActive")} 
                    className="fw-bold text-primary fs-5" 
                    disabled={isSubmitting}
                />
            </div>

            <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2 rounded-pill shadow fs-5 mb-3" 
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <><Spinner size="sm" animation="border" /> جاري حفظ البيانات والرفع...</>
              ) : (
                  <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات النهائية' : 'إنشاء ونشر المشروع'}</>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
