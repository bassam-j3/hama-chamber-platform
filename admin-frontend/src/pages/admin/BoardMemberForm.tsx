import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../api/axiosInstance";
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(3, "الاسم مطلوب"),
  roleTitle: z.string().min(2, "المسمى الوظيفي مطلوب"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function BoardMemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { isActive: true }
  });

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.item;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/board-members").then(res => {
          const item = res.data.find((p: any) => p.id === id);
          if (item) populateForm(item);
        }).finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("name", data.name);
    setValue("roleTitle", data.roleTitle);
    setValue("isActive", data.isActive);
    setPreviewUrl(data.imageUrl || null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري الحفظ...');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('roleTitle', data.roleTitle);
      formData.append('isActive', data.isActive.toString());
      if (selectedFile) formData.append('image', selectedFile);

      if (id) {
        await axiosInstance.put(`/board-members/${id}`, formData);
        toast.success('تم التحديث بنجاح!', { id: toastId });
      } else {
        await axiosInstance.post("/board-members", formData);
        toast.success('تمت الإضافة بنجاح!', { id: toastId });
      }
      navigate('/admin/board-members');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ', { id: toastId });
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
            <h4 className="text-primary fw-bold">{id ? 'تعديل العضو' : 'إضافة عضو جديد'}</h4>
            <Button variant="light" onClick={() => navigate('/admin/board-members')}>عودة</Button>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>الاسم الثلاثي</Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register("name")} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>المسمى الوظيفي (مثال: رئيس المجلس)</Form.Label>
              <Form.Control isInvalid={!!errors.roleTitle} {...register("roleTitle")} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>الصورة الشخصية</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e: any) => {
                const file = e.target.files[0];
                if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
              }} />
              {previewUrl && <img src={previewUrl} className="mt-3 rounded" style={{ height: '100px' }} />}
            </Form.Group>
            <Form.Check type="switch" label="عضو نشط" {...register("isActive")} className="mb-4 fw-bold" />
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">
              {isSubmitting ? <Spinner size="sm" /> : 'حفظ البيانات'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}