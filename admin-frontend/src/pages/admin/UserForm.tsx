import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'editor', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && location.state?.userItem) {
      const u = location.state.userItem;
      setFormData({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive });
    }
  }, [id, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setError('');

    if (!isEdit && formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsSubmitting(false); return;
    }

    try {
      const payload: any = { ...formData };
      if (isEdit && !payload.password) delete payload.password; // لا ترسل الباسورد إذا كانت فارغة في التعديل

      if (isEdit) await axiosInstance.put(`/users/${id}`, payload);
      else await axiosInstance.post('/users', payload);
      
      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المستخدم');
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
            <Button variant="light" onClick={() => navigate('/admin/users')}>عودة للقائمة</Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>الاسم الكامل</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control type="email" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>كلمة المرور {isEdit && <small className="text-muted">(اتركها فارغة إذا لم ترد تغييرها)</small>}</Form.Label>
              <Form.Control type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEdit} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الصلاحية (الرتبة)</Form.Label>
              <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="editor">محرر (صلاحيات محدودة)</option>
                <option value="admin">مدير إداري</option>
                <option value="super_admin">مدير عام (صلاحيات كاملة)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4 pt-3 border-top">
              <Form.Check type="switch" label="حساب نشط (يمكنه تسجيل الدخول)" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="fw-bold text-primary" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" animation="border" /> : 'حفظ البيانات'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}