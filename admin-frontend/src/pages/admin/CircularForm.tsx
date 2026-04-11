import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, "عنوان التعميم مطلوب"),
  content: z.string().min(5, "نص التعميم مطلوب"),
  category: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Circular {
  id: string;
  title: string;
  content: string;
  category?: string;
  isActive: boolean;
}

export default function CircularForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(schema), defaultValues: { isActive: true, content: "" }
  });

  const editorContent = watch("content");

  const populateForm = useCallback((data: Circular) => {
    setValue("title", data.title); 
    setValue("content", data.content);
    setValue("category", data.category || ""); 
    setValue("isActive", data.isActive);
  }, [setValue]);

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.item as Circular | undefined;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/circulars").then(res => {
          const item = res.data.find((p: Circular) => p.id === id);
          if (item) populateForm(item);
        }).catch(() => {
          toast.error("فشل في تحميل بيانات التعميم");
        }).finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state, populateForm]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري الحفظ...');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (data.category) formData.append('category', data.category);
      if (selectedFile) formData.append('image', selectedFile);

      if (id) await axiosInstance.put(`/circulars/${id}`, formData);
      else await axiosInstance.post("/circulars", formData);
      
      toast.success('تم الحفظ بنجاح', { id: toastId });
      navigate('/admin/circulars');
    } catch { 
      toast.error('فشل الحفظ', { id: toastId }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between mb-4">
            <h4 className="fw-bold">{id ? 'تعديل التعميم' : 'إضافة تعميم جديد'}</h4>
            <Button variant="light" onClick={() => navigate('/admin/circulars')}>عودة</Button>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>عنوان التعميم</Form.Label>
              <Form.Control isInvalid={!!errors.title} {...register("title")} id="title" />
            </Form.Group>
            <Form.Group className="mb-4" style={{ height: '250px', paddingBottom: '50px' }}>
              <Form.Label>النص والتفاصيل</Form.Label>
              <ReactQuill theme="snow" value={editorContent} onChange={v => setValue("content", v)} style={{ height: '150px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>مرفق التعميم (صورة - اختياري)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }} />
            </Form.Group>
            <Form.Check type="switch" label="نشر التعميم" {...register("isActive")} className="mb-4 fw-bold" id="isActive" />
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">حفظ التعميم</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
