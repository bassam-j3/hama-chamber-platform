import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setStatus({ type: 'error', message: 'كلمتا المرور غير متطابقتين!' });
    if (password.length < 6) return setStatus({ type: 'error', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });

    setIsLoading(true); setStatus({ type: '', message: '' });

    try {
      await axiosInstance.post(`/users/reset-password/${token}`, { password });
      setStatus({ type: 'success', message: 'تم تغيير كلمة المرور بنجاح! جاري التوجيه...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'الرابط غير صالح أو منتهي الصلاحية.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      {/* خلفية جمالية */}
      <div className="position-absolute top-0 start-0 w-100 h-50 bg-primary z-0" style={{ borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%', transform: 'scaleX(1.5)' }}></div>
      
      <Container className="position-relative z-1 d-flex justify-content-center">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: '450px' }}>
          
          <div className="bg-custom-dark text-center p-4 pt-5 border-bottom border-gold border-opacity-25">
            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-primary shadow mb-3" style={{ width: '70px', height: '70px' }}>
              <span className="material-symbols-outlined display-5">password</span>
            </div>
            <h3 className="fw-bold text-white mb-1">تعيين كلمة مرور جديدة</h3>
            <p className="text-white-50 small mb-0">يرجى كتابة كلمة مرور قوية وحفظها</p>
          </div>
          
          <Card.Body className="p-4 p-md-5 bg-white">
            {status.message && <Alert variant={status.type === 'success' ? 'success' : 'danger'} className="small fw-bold border-0 rounded-3 text-center">{status.message}</Alert>}
            
            <Form onSubmit={handleSubmit}>
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
                  />
                </div>
              </Form.Group>

              <Button type="submit" className="w-100 btn-primary fw-bold py-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" animation="border" /> : 'حفظ كلمة المرور'}
                {!isLoading && <span className="material-symbols-outlined fs-5">save</span>}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-decoration-none text-secondary small fw-bold hover-text-primary transition-all d-flex justify-content-center align-items-center gap-1">
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