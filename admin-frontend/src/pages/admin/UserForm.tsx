import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface UserItem {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EDITOR', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && location.state?.userItem) {
      const u = location.state.userItem as UserItem;
      setFormData({ name: u.name, email: u.email, password: '', role: u.role || 'EDITOR', isActive: u.isActive });
    }
  }, [isEdit, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEdit ? 'جاري تحديث بيانات المستخدم...' : 'جاري إضافة المستخدم...');

    try {
      const payload: Partial<typeof formData> = { ...formData };
      if (isEdit && !payload.password) delete payload.password;

      if (isEdit) {
        await axiosInstance.put(`/users/${id}`, payload);
        toast.success("تم تحديث المستخدم بنجاح!", { id: toastId });
      } else {
        await axiosInstance.post('/users', payload);
        toast.success("تمت إضافة المستخدم بنجاح!", { id: toastId });
      }
      
      navigate('/admin/users', { replace: true });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'حدث خطأ أثناء حفظ المستخدم', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">{isEdit ? 'manage_accounts' : 'person_add'}</span>
              {isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
            </h4>
            <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => navigate('/admin/users')}>
              عودة للقائمة
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-dark">الاسم الكامل</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={isSubmitting} className="py-2" id="name" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-dark">البريد الإلكتروني</Form.Label>
              <Form.Control type="email" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={isSubmitting} className="py-2" id="email" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-dark">كلمة المرور {isEdit && <small className="text-muted fw-normal">(اتركها فارغة إذا لم ترد تغييرها)</small>}</Form.Label>
              <Form.Control type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEdit} disabled={isSubmitting} className="py-2" dir="ltr" id="password" />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-dark">الصلاحية (الرتبة)</Form.Label>
              <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={isSubmitting} className="py-2 fw-bold" id="role">
                <option value="EDITOR">محرر (صلاحيات محدودة)</option>
                <option value="ADMIN">مدير نظام (صلاحيات كاملة)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4 pt-3 border-top">
              <Form.Check type="switch" label="حساب نشط (يمكنه تسجيل الدخول للوحة التحكم)" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="fw-bold text-primary fs-5" disabled={isSubmitting} id="isActive" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow-sm fs-5 d-flex justify-content-center align-items-center gap-2 rounded-pill" disabled={isSubmitting}>
              {isSubmitting ? ( <><Spinner size="sm" animation="border" /> جاري الحفظ...</> ) : ( <><span className="material-symbols-outlined">save</span> {isEdit ? 'حفظ التعديلات' : 'إنشاء الحساب'}</> )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
