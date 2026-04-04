// src/pages/admin/ProjectForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';

const projectSchema = z.object({
  title: z.string().min(3, "عنوان المشروع مطلوب"),
  content: z.string().min(10, "التفاصيل مطلوبة (10 أحرف على الأقل)"),
  isActive: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const isVideo = (url: string | null) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({ 
    resolver: zodResolver(projectSchema),
    defaultValues: { isActive: true, content: "" }
  });
  
  const editorContent = watch("content");

  // Fetch data if editing
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
            console.error(err);
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
    setFileType(isVideo(data.imageUrl) ? 'video' : 'image');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video') ? 'video' : 'image');
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ المشروع...');
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await axiosInstance.put(`/projects/${id}`, formData, config);
        toast.success('تم تحديث المشروع بنجاح!', { id: toastId });
      } else {
        await axiosInstance.post("/projects", formData, config);
        toast.success('تمت إضافة المشروع بنجاح!', { id: toastId });
      }
      
      // Navigate immediately, the toast will persist globally
      navigate('/admin/projects');
      
    } catch (error) { 
      toast.error('حدث خطأ أثناء حفظ المشروع.', { id: toastId }); 
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
              {id ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/projects')}>
              عودة للقائمة
            </Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">عنوان المشروع</Form.Label>
              <Form.Control type="text" placeholder="مثال: الشركة الأهلية للزيوت - حماة" isInvalid={!!errors.title} {...register("title")} className="py-2" />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">تفاصيل المشروع بالكامل</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill 
                  theme="snow" 
                  value={editorContent || ""} 
                  onChange={(val: string) => setValue("content", val, { shouldValidate: true })} 
                  style={{ height: '300px' }} 
                />
              </div>
              {errors.content && <div className="text-danger mt-5 small fw-bold">{errors.content.message}</div>}
            </Form.Group>

            <Form.Group className="mb-4 pt-4 border-top">
              <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
              <Form.Check type="switch" id="custom-switch" label="نشر في الموقع العام" {...register("isActive")} className="fw-bold text-primary fs-5" />
            </Form.Group>

            <Form.Group className="mb-5 text-center">
              <Form.Label className="fw-bold text-dark d-block mb-3">صورة أو فيديو المشروع</Form.Label>
              <input type="file" accept="image/*,video/*" id="file-upload" className="d-none" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="d-flex flex-column align-items-center justify-content-center border border-2 border-primary rounded-4 p-4 mx-auto transition-hover" style={{ maxWidth: '500px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderStyle: 'dashed !important' }}>
                {previewUrl ? (
                  <div className="position-relative w-100">
                    {fileType === 'video' ? (
                      <video src={previewUrl} controls className="rounded-3 shadow-sm border border-white border-3 w-100" style={{ height: '250px', objectFit: 'cover' }} />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="rounded-3 shadow-sm border border-white border-3 w-100" style={{ height: '250px', objectFit: 'cover' }} />
                    )}
                    <div className="mt-3 text-primary fw-bold d-flex align-items-center justify-content-center gap-1"><span className="material-symbols-outlined fs-5">edit</span> تغيير الملف</div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                      <span className="material-symbols-outlined fs-1">movie</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">اضغط لاختيار صورة أو فيديو</h6>
                    <small className="text-muted">يدعم MP4, WEBM, JPG, PNG</small>
                  </>
                )}
              </label>
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ والرفع...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'حفظ المشروع'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}