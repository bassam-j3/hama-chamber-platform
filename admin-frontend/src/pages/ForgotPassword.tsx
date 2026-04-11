import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string, token?: string }>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axiosInstance.post('/users/forgot-password', { email });
      setStatus({ 
        type: 'success', 
        message: 'تم إنشاء رابط الاستعادة بنجاح.',
        token: response.data.resetToken 
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus({ type: 'error', message: error.response?.data?.message || 'البريد الإلكتروني غير مسجل لدينا' });
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
              <span className="material-symbols-outlined display-5">lock_reset</span>
            </div>
            <h3 className="fw-bold text-white mb-1">نسيت كلمة المرور؟</h3>
            <p className="text-white-50 small mb-0">أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</p>
          </div>
          
          <Card.Body className="p-4 p-md-5 bg-white">
            {status.message && (
              <Alert variant={status.type === 'success' ? 'success' : 'danger'} className="small fw-bold border-0 rounded-3 text-center">
                {status.message}
                {status.token && (
                  <div className="mt-3">
                    <hr className="opacity-25" />
                    <small className="text-muted d-block mb-2">رابط الاختبار (للمطورين):</small>
                    <Link to={`/reset-password/${status.token}`} className="btn btn-sm btn-outline-primary w-100 rounded-3">انتقل لصفحة التغيير</Link>
                  </div>
                )}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">البريد الإلكتروني</Form.Label>
                <div className="position-relative">
                  <span className="material-symbols-outlined position-absolute top-50 translate-middle-y text-muted ms-3" style={{ right: '12px' }}>mail</span>
                  <Form.Control 
                    type="email" 
                    placeholder="admin@hamachamber.com" 
                    className="py-3 ps-5 bg-light border-0 shadow-none rounded-3" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </Form.Group>
              
              <Button type="submit" className="w-100 btn-primary fw-bold py-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" animation="border" /> : 'إرسال الرابط'}
                {!isLoading && <span className="material-symbols-outlined fs-5">send</span>}
              </Button>
            </Form>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-decoration-none text-secondary small fw-bold hover-text-primary transition-all d-flex justify-content-center align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">arrow_back</span>
                العودة لتسجيل الدخول
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}