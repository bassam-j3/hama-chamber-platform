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

const faqSchema = z.object({
  question: z.string().min(5, "السؤال مطلوب (5 أحرف على الأقل)"),
  answer: z.string().min(10, "الإجابة مطلوبة (10 أحرف على الأقل)"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof faqSchema>;

export default function FaqForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(faqSchema), defaultValues: { isActive: true, answer: "" }
  });
  
  const editorContent = watch("answer");

  useEffect(() => {
    if (id) {
      const stateItem = location.state?.faqItem;
      if (stateItem) {
        populateForm(stateItem);
      } else {
        setIsLoading(true);
        axiosInstance.get("/faqs")
          .then(res => {
            const item = res.data.find((f: any) => f.id === id);
            if (item) populateForm(item);
          })
          .catch(err => {
            console.error(err);
            toast.error("فشل في تحميل بيانات السؤال");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setValue("question", data.question);
    setValue("answer", data.answer);
    setValue("isActive", data.isActive);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('جاري الحفظ...');
    try {
      if (id) {
        await axiosInstance.put(`/faqs/${id}`, data);
        toast.success("تم تحديث السؤال بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post("/faqs", data);
        toast.success("تمت إضافة السؤال بنجاح!", { id: toastId });
      }
      navigate('/admin/faqs');
    } catch (error) { 
        toast.error("حدث خطأ أثناء الحفظ.", { id: toastId }); 
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
              {id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm" onClick={() => navigate('/admin/faqs')}>عودة للقائمة</Button>
          </div>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">نص السؤال</Form.Label>
              <Form.Control type="text" placeholder="مثال: ما هي الأوراق المطلوبة لتجديد السجل التجاري؟" isInvalid={!!errors.question} {...register("question")} className="py-2 fw-bold" />
              <Form.Control.Feedback type="invalid">{errors.question?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" style={{ paddingBottom: '40px' }}>
              <Form.Label className="fw-bold text-dark">الإجابة</Form.Label>
              <div style={{ direction: 'rtl' }}>
                {/* @ts-ignore */}
                <ReactQuill theme="snow" value={editorContent || ""} onChange={(val: string) => setValue("answer", val, { shouldValidate: true })} style={{ height: '200px' }} />
              </div>
              {errors.answer && <div className="text-danger mt-5 small fw-bold">{errors.answer.message}</div>}
            </Form.Group>

            <Form.Group className="mb-5 pt-3 border-top">
              <Form.Label className="fw-bold text-dark">حالة النشر</Form.Label>
              <Form.Check type="switch" label="عرض السؤال في الموقع العام" {...register("isActive")} className="fw-bold text-primary fs-5" />
            </Form.Group>

            <Button variant="primary" type="submit" className="px-5 py-3 fw-bold w-100 shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ...</> ) : ( <><span className="material-symbols-outlined">save</span> {id ? 'حفظ التعديلات' : 'إضافة السؤال'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}