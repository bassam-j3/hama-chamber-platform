import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import { formatDate, stripHtml } from '../utils/format';
import type { Law } from '../types/public';

export default function PublicLaws() {
  const [data, setData] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/laws');
      setData(response.data.filter((i: Law) => i.isActive));
    } catch (err) {
      setError('تعذر تحميل القوانين والتشريعات.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="القوانين والتشريعات"
      description="أحدث القوانين والمراسيم والتشريعات التجارية والاقتصادية"
      icon="gavel"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا توجد قوانين منشورة حالياً."
      renderCard={(item: Law) => (
        <Card className="h-100 border-0 rounded-4 shadow-sm hover-translate-y transition-all bg-white">
          <Card.Body className="p-4 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
              <span className="material-symbols-outlined fs-6">calendar_today</span> 
              <span className="fw-medium">{formatDate(item.createdAt)}</span>
            </div>
            <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
            <Card.Text className="text-secondary small mb-4 line-clamp-3">{stripHtml(item.content)}</Card.Text>
            {item.fileUrl && (
              <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mt-auto btn btn-light text-primary fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill">
                <span className="material-symbols-outlined fs-5">download</span> تحميل الملف المرفق
              </a>
            )}
          </Card.Body>
        </Card>
      )}
    />
  );
}