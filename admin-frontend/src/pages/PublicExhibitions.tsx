import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import { formatDate, stripHtml } from '../utils/format';
import type { Exhibition } from '../types/public';

export default function PublicExhibitions() {
  const [data, setData] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/exhibitions');
      setData(response.data.filter((i: Exhibition) => i.isActive));
    } catch {
      setError('تعذر تحميل المعارض والمؤتمرات.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="المعارض والمؤتمرات"
      description="مشاركات الغرفة في الفعاليات والمعارض المحلية والدولية"
      icon="storefront"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا توجد معارض منشورة حالياً."
      renderCard={(item: Exhibition) => (
        <Card className="h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-translate-y transition-all bg-white">
           <div style={{ height: "200px" }} className="bg-light d-flex align-items-center justify-content-center">
            {item.imageUrl ? (
              <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover" />
            ) : (
              <span className="material-symbols-outlined fs-1 text-muted">storefront</span>
            )}
          </div>
          <Card.Body className="p-4 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 text-primary small mb-3 fw-bold">
              <span className="material-symbols-outlined fs-6">event</span> 
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
            <Card.Text className="text-secondary small mb-0 line-clamp-3">{stripHtml(item.content)}</Card.Text>
          </Card.Body>
        </Card>
      )}
    />
  );
}