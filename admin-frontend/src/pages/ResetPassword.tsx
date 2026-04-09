import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // تأكد أن المسار صحيح لملف axios الخاص بك

export default function ResetPassword() {
  // سحب التوكن من الرابط تلقائياً
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', message: 'كلمتا المرور غير متطابقتين!' });
    }
    if (password.length < 6) {
      return setStatus({ type: 'error', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
    }

    setIsLoading(true); 
    setStatus({ type: '', message: '' });

    try {
      // إرسال كلمة المرور الجديدة مع التوكن إلى الباكند
      await axiosInstance.post(`/users/reset-password/${token}`, { password });
      
      setStatus({ type: 'success', message: 'تم تغيير كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...' });
      
      // توجيه المستخدم لصفحة تسجيل الدخول بعد ثانيتين
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'الرابط غير صالح أو منتهي الصلاحية.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ backgroundColor: '#f6f8f8' }}>
      
      <Container className="position-relative z-1 d-flex justify-content-center">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: '450px' }}>
          
          <div className="bg-primary text-center p-4 pt-5 border-bottom border-gold" style={{ borderBottomWidth: '4px' }}>
            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-primary shadow mb-3" style={{ width: '70px', height: '70px' }}>
              <span className="material-symbols-outlined display-5">password</span>
            </div>
            <h3 className="fw-bold text-white mb-1">كلمة مرور جديدة</h3>
            <p className="text-white-50 small mb-0">يرجى كتابة كلمة مرور قوية وحفظها</p>
          </div>
          
          <Card.Body className="p-4 p-md-5 bg-white">
            {status.message && (
              <Alert variant={status.type === 'success' ? 'success' : 'danger'} className="small fw-bold border-0 rounded-3 text-center">
                {status.message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit} dir="rtl">
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">كلمة المرور الجديدة</Form.Label>
                <div className="position-relative">
                  <span className="material-symbols-outlined position-absolute top-50 translate-middle-y text-muted ms-3" style={{ right: '12px' }}>lock</span>
                  <Form.Control 
                    type="password" 
                    placeholder="••••••••" 
                    className="py-3 ps-5 bg-light border-0 shadow-none rounded-3" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">تأكيد كلمة المرور</Form.Label>
                <div className="position-relative">
                  <span className="material-symbols-outlined position-absolute top-50 translate-middle-y text-muted ms-3" style={{ right: '12px' }}>lock_reset</span>
                  <Form.Control 
                    type="password" 
                    placeholder="••••••••" 
                    className="py-3 ps-5 bg-light border-0 shadow-none rounded-3" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>
              </Form.Group>

              <Button type="submit" className="w-100 btn-primary fw-bold py-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2 transition-all hover-translate-y" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" animation="border" /> : 'حفظ كلمة المرور وتفعيلها'}
                {!isLoading && <span className="material-symbols-outlined fs-5">save</span>}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-decoration-none text-secondary small fw-bold hover-gold transition-all d-flex justify-content-center align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">close</span>
                إلغاء والعودة لتسجيل الدخول
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}