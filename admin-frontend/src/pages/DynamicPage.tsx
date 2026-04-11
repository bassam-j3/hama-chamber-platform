import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Container, Spinner, Badge } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/useAuth'; // 👈 1. استيراد حالة تسجيل الدخول

interface PageData {
  id: string;
  title: string;
  content: string;
  slug: string;
  isActive: boolean;
  isSecure: boolean;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const passcode = searchParams.get('passcode'); 
  
  // 👈 2. جلب حالة المدير لمعرفة ما إذا كان مسجلاً للدخول
  const authContext = useAuth?.();
  const isAuthenticated = authContext?.isAuthenticated || false;

  const [page, setPage] = useState<PageData | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'restricted' | 'success'>('loading');

  useEffect(() => {
    const fetchPage = async () => {
      setStatus('loading');
      try {
        const response = await axiosInstance.get(`/pages/slug/${slug}`);
        const fetchedPage = response.data;

        if (fetchedPage && fetchedPage.isActive) {
          
          // 👈 3. البواب الذكي: إذا الصفحة محمية **والزائر ليس مديراً**، طبق الفحص!
          if (fetchedPage.isSecure && !isAuthenticated) {
            
            if (passcode !== "HAMA2026") {
              setStatus('restricted');
              return;
            }
            
            const url = new URL(window.location.href);
            url.searchParams.delete('passcode');
            window.history.replaceState({}, '', url);
          }

          setPage(fetchedPage);
          setStatus('success');

        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    if (slug) fetchPage();
  }, [slug, passcode, isAuthenticated]); // 👈 4. إضافة isAuthenticated للمتغيرات المراقبة

  if (status === 'loading') {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5 flex-grow-1">
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem', borderWidth: '0.25em' }} />
        <h5 className="mt-4 text-primary fw-bold">جاري فتح الصفحة...</h5>
      </div>
    );
  }

  if (status === 'restricted') {
    return (
      <Container className="py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <div className="bg-white p-5 rounded-4 shadow-sm border-top border-4 border-danger" style={{ maxWidth: '500px' }}>
          <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '5rem' }}>qr_code_scanner</span>
          <h3 className="fw-bold text-dark mb-3">وصول مقيد</h3>
          <p className="text-secondary lh-lg mb-4">
            هذه الصفحة محمية ولا يمكن الوصول إليها عبر الرابط المباشر. يرجى مسح رمز الـ <strong>QR Code</strong> الأصلي.
          </p>
          <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-pill transition-all">العودة للرئيسية</Link>
        </div>
      </Container>
    );
  }

  if (status === 'error' || !page) {
    return (
      <Container className="py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '5rem' }}>error</span>
        <h2 className="fw-bold text-dark mb-4">الصفحة غير موجودة</h2>
        <Link to="/" className="btn btn-primary fw-bold px-5 py-3 rounded-3 shadow-sm transition-all">العودة للرئيسية</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5 flex-grow-1">
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light transition-all hover-shadow-lg">
        <div className="border-bottom border-light pb-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <Link to="/" className="text-secondary text-decoration-none hover-text-primary transition-all d-flex align-items-center gap-1 small fw-bold">
                الرئيسية <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
              </Link>
              <span className="text-primary small fw-bold">{page.title}</span>
            </div>
            
            {page.isSecure ? (
              <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-6">lock_open</span> موثق وآمن بالـ QR</Badge>
            ) : (
              <Badge bg="primary" className="px-3 py-2 rounded-pill shadow-sm bg-opacity-75">صفحة عامة</Badge>
            )}
          </div>
          
          <h1 className="fw-bolder text-dark lh-base mb-0 display-6">{page.title}</h1>
        </div>

        <div className="text-secondary lh-lg fs-5 custom-html-content" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </Container>
  );
}