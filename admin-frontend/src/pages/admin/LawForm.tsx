import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, "عنوان القانون مطلوب"),
  content: z.string().min(5, "نص القانون مطلوب"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function LawForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(schema), defaultValues: { isActive: true, content: "" }
  });

  useEffect(() => {
    if (id) {
      if (location.state?.item) {
        setValue("title", location.state.item.title);
        setValue("content", location.state.item.content);
        setValue("isActive", location.state.item.isActive);
      } else {
        setIsLoading(true);
        axiosInstance.get("/laws").then(res => {
          const item = res.data.find((p: any) => p.id === id);
          if (item) {
            setValue("title", item.title); setValue("content", item.content); setValue("isActive", item.isActive);
          }
        }).finally(() => setIsLoading(false));
      }
    }
  }, [id]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري الحفظ...');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile); // Or 'file' based on backend

      if (id) await axiosInstance.put(`/laws/${id}`, formData);
      else await axiosInstance.post("/laws", formData);
      
      toast.success('تم الحفظ بنجاح', { id: toastId });
      navigate('/admin/laws');
    } catch (error) { toast.error('فشل الحفظ', { id: toastId }); } 
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <Container fluid className="max-w-75 mb-5">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between mb-4">
            <h4 className="fw-bold">{id ? 'تعديل القانون' : 'إضافة قانون جديد'}</h4>
            <Button variant="light" onClick={() => navigate('/admin/laws')}>عودة</Button>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>عنوان القانون / المرسوم</Form.Label>
              <Form.Control isInvalid={!!errors.title} {...register("title")} />
            </Form.Group>
            <Form.Group className="mb-4" style={{ height: '250px', paddingBottom: '50px' }}>
              <Form.Label>نص القانون</Form.Label>
              <ReactQuill theme="snow" value={watch("content")} onChange={v => setValue("content", v)} style={{ height: '150px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ملف مرفق (PDF / صورة - اختياري)</Form.Label>
              <Form.Control type="file" onChange={(e: any) => setSelectedFile(e.target.files[0])} />
            </Form.Group>
            <Form.Check type="switch" label="نشر القانون" {...register("isActive")} className="mb-4 fw-bold" />
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">حفظ القانون</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}