import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

interface PageData {
  id: string;
  title: string;
  content: string;
  image?: string;
}

export default function SecureQrView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const SECRET_SALT = "HAMA_CHAMBER_SECURE_2026";

  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (!token) throw new Error("No token");
        
        const decodedRaw = decodeURIComponent(atob(token));
        if (!decodedRaw.endsWith(`|||${SECRET_SALT}`)) throw new Error("Invalid Token");
        
        const slug = decodedRaw.split('|||')[0];
        const response = await axiosInstance.get(`/pages/slug/${slug}`);
        setPageData(response.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <Container className="py-5 text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <span className="material-symbols-outlined text-danger" style={{ fontSize: '5rem' }}>gpp_bad</span>
        <h2 className="mt-3 text-dark fw-bold">عذراً، وصول غير مصرح به</h2>
        <p className="text-muted">هذا الرابط غير صالح أو تم التلاعب به.</p>
        <button className="btn btn-primary px-4 py-2 mt-3 fw-bold rounded-pill shadow-sm" onClick={() => navigate('/')}>
          العودة للصفحة الرئيسية
        </button>
      </Container>
    );
  }

  // العرض النهائي والأنيق المتوافق مع تصميم الموقع
  return (
    <div className="dynamic-page-container pb-5 bg-light min-vh-100" dir="rtl">
      {/* عرض صورة الغلاف إن وجدت */}
      {pageData.image && (
        <div className="page-hero-image mb-5 shadow-sm" style={{ height: '350px', width: '100%', overflow: 'hidden' }}>
          <img src={`https://hama-chamber-api.onrender.com${pageData.image}`} alt={pageData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      
      <Container className={!pageData.image ? 'pt-5' : ''}>
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border-top border-4 border-primary">
          <h1 className="fw-bold text-primary mb-4 pb-3 border-bottom d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-gold fs-2">verified_user</span>
            {pageData.title}
          </h1>
          
          <div 
            className="page-content text-dark"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
            style={{ fontSize: '1.15rem', lineHeight: '1.9' }}
          />
        </div>
      </Container>
    </div>
  );
}