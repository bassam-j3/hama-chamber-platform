import { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import { formatDate, stripHtml } from '../utils/format';
import type { Circular } from '../types/public';

export default function PublicCirculars() {
  const [data, setData] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/circulars');
      setData(response.data.filter((i: Circular) => i.isActive));
    } catch {
      setError('تعذر تحميل التعاميم والقرارات.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="التعاميم والقرارات"
      description="قرارات وتعاميم هامة صادرة عن الغرفة والوزارات المعنية"
      icon="assignment"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا توجد تعاميم منشورة حالياً."
      renderCard={(item: Circular) => (
        <Card className="h-100 border-0 rounded-4 shadow-sm hover-translate-y transition-all bg-white border-top border-4 border-info">
          <Card.Body className="p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Badge bg="info" className="text-dark rounded-pill px-3 py-2 fw-medium shadow-sm">{item.category}</Badge>
              <div className="d-flex align-items-center gap-1 text-secondary small">
                <span className="material-symbols-outlined fs-6">schedule</span> 
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
            <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
            <Card.Text className="text-secondary small mb-0 line-clamp-4">{stripHtml(item.content)}</Card.Text>
          </Card.Body>
        </Card>
      )}
    />
  );
}