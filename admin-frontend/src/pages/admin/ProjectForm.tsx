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

const projectSchema = z.object({
  title: z.string().min(3, "عنوان المشروع مطلوب"),
  content: z.string().min(10, "التفاصيل مطلوبة"),
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

  // Gallery State (Phase 2)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({ 
    resolver: zodResolver(projectSchema),
    defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  useEffect(() => {
    if (id) {
      const stateProject = location.state?.projectItem;
      if (stateProject) {
        populateForm(stateProject);
      } else {
        setIsLoading(true);
        axiosInstance.get("/projects")
          .then(res => {
            const item = res.data.find((p: any) => p.id === id);
            if (item) populateForm(item);
          })
          .catch(err => {
            toast.error("فشل في تحميل بيانات المشروع");
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
    setExistingImages(data.images || []);
    setFileType(data.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video') ? 'video' : 'image');
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

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ المشروع والمعرض...');
    
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
        toast.success('تم التحديث بنجاح!', { id: toastId });
      } else {
        await axiosInstance.post("/projects", formData, config);
        toast.success('تمت إضافة المشروع بنجاح!', { id: toastId });
      }
      navigate('/admin/projects');
    } catch (error) { 
      toast.error('حدث خطأ أثناء الحفظ.', { id: toastId }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0"> {id ? 'تعديل المشروع' : 'مشروع جديد'}</h4>
            <Button variant="light" className="fw-bold border" onClick={() => navigate('/admin/projects')}>عودة</Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">عنوان المشروع</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.title} {...register("title")} className="py-2" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold">التفاصيل</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val) => setValue("content", val)} style={{ height: '300px' }} />
              </div>
            </Form.Group>

            {/* Cover Section */}
            <Form.Group className="mb-5 pt-4 border-top text-center">
              <Form.Label className="fw-bold d-block mb-3">غلاف المشروع الرئيسي (صورة أو فيديو)</Form.Label>
              <input type="file" accept="image/*,video/*" id="project-main" className="d-none" onChange={handleFileChange} />
              <label htmlFor="project-main" className="border border-2 border-primary rounded-4 p-3 d-inline-block cursor-pointer" style={{ borderStyle: 'dashed' }}>
                {previewUrl ? (
                  fileType === 'video' ? <video src={previewUrl} style={{maxHeight:'150px'}} /> : <img src={previewUrl} style={{maxHeight:'150px'}} />
                ) : <div className="p-4 text-muted">اضغط للاختيار</div>}
              </label>
            </Form.Group>

            {/* Gallery Section */}
            <Card className="bg-light border-0 rounded-4 mb-5">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                   <span className="material-symbols-outlined">collections</span> صور إضافية للمشروع
                </h6>
                <input type="file" multiple accept="image/*" id="gallery-proj" className="d-none" onChange={handleGalleryChange} />
                <label htmlFor="gallery-proj" className="btn btn-outline-primary btn-sm fw-bold mb-3">إضافة صور</label>
                
                <Row className="g-2">
                  {existingImages.map((url, idx) => (
                    <Col key={`ex-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded object-fit-cover shadow-sm" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeExistingGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle">×</button>
                    </Col>
                  ))}
                  {galleryPreviews.map((url, idx) => (
                    <Col key={`new-${idx}`} xs={4} md={2} className="position-relative">
                      <img src={url} className="w-100 rounded border border-primary object-fit-cover" style={{ height: '80px' }} />
                      <button type="button" onClick={() => removeNewGalleryImage(idx)} className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle">×</button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Form.Check type="switch" label="نشر في الموقع" {...register("isActive")} className="mb-4 fw-bold" />

            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" animation="border" /> : <><span className="material-symbols-outlined">save</span> حفظ المشروع</>}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}