// src/pages/DynamicPage.tsx
import  { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Badge } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

interface PageData {
  id: string;
  title: string;
  content: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/pages/slug/${slug}`);
        if (response.data && response.data.isActive) {
          setPage(response.data);
        } else {
          setError("الصفحة غير موجودة أو غير مفعلة حالياً.");
        }
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء جلب بيانات الصفحة.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5 flex-grow-1">
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem', borderWidth: '0.25em' }} />
        <h5 className="mt-4 text-primary fw-bold">جاري تحميل الصفحة...</h5>
      </div>
    );
  }

  // حالة الخطأ أو الصفحة غير موجودة
  if (error || !page) {
    return (
      <Container className="py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '5rem' }}>error</span>
        <h2 className="fw-bold text-dark mb-4">{error || "الصفحة غير موجودة"}</h2>
        <Link to="/" className="btn btn-primary fw-bold px-5 py-3 rounded-3 shadow-sm transition-all hover-translate-y">
          العودة للصفحة الرئيسية
        </Link>
      </Container>
    );
  }

  // العرض الناجح لمحتوى الصفحة (بدون Navbar، المحتوى فقط)
  return (
    <Container className="py-5 flex-grow-1">
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light transition-all hover-shadow-lg">
        
        {/* ترويسة الصفحة الداخلية */}
        <div className="border-bottom border-light pb-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Link to="/" className="text-secondary text-decoration-none hover-text-primary transition-all d-flex align-items-center gap-1 small fw-bold">
              الرئيسية <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
            </Link>
            <span className="text-primary small fw-bold">{page.title}</span>
          </div>
          
          <Badge bg="gold" className="text-primary px-3 py-2 rounded-pill mb-3 shadow-sm">دليل الغرفة</Badge>
          <h1 className="fw-bolder text-dark lh-base mb-0 display-6">{page.title}</h1>
        </div>

        {/* المحتوى الغني (Rich Text) القادم من لوحة التحكم */}
        <div 
          className="text-secondary lh-lg fs-5 custom-html-content" 
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </Container>
  );
}