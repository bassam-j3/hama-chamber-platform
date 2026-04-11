import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // أضفنا Link هنا
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      // تخزين بيانات الدخول
      login(response.data.user);
      // التوجيه للوحة التحكم
      navigate('/admin');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      {/* خلفية جمالية مشابهة للموقع العام */}
      <div className="position-absolute top-0 start-0 w-100 h-50 bg-primary z-0" style={{ borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%', transform: 'scaleX(1.5)' }}></div>
      
      <Container className="position-relative z-1 d-flex justify-content-center">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="bg-custom-dark text-center p-4 pt-5 border-bottom border-gold border-opacity-25">
            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-primary shadow mb-3" style={{ width: '70px', height: '70px' }}>
              <span className="material-symbols-outlined display-5">admin_panel_settings</span>
            </div>
            <h3 className="fw-bold text-white mb-1">تسجيل الدخول</h3>
            <p className="text-white-50 small mb-0">بوابة الإدارة - غرفة تجارة حماة</p>
          </div>
          
          <Card.Body className="p-4 p-md-5 bg-white">
            {error && <Alert variant="danger" className="small fw-bold border-0 rounded-3 text-center">{error}</Alert>}
            
            <Form onSubmit={handleLogin}>
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

              <Form.Group className="mb-4">
                {/* === التعديل هنا: وضعنا الـ Label ورابط "نسيت كلمة المرور" في سطر واحد === */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="small fw-bold text-secondary mb-0">كلمة المرور</Form.Label>
                  <Link to="/forgot-password" className="text-decoration-none text-primary small fw-bold transition-all hover-text-gold">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                {/* ========================================================================= */}
                
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

              <Button type="submit" className="w-100 btn-primary fw-bold py-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2 mt-2" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" animation="border" /> : 'تسجيل الدخول'}
                {!isLoading && <span className="material-symbols-outlined fs-5">login</span>}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}