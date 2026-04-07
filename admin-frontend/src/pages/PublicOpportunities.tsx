import { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import { formatDate, stripHtml } from '../utils/format';
import type { Opportunity } from '../types/public';

export default function PublicOpportunities() {
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/opportunities');
      setData(response.data.filter((i: Opportunity) => i.isActive));
    } catch (err) {
      setError('تعذر تحميل الفرص الاستثمارية.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="الفرص الاستثمارية ومناقصات"
      description="أهم الفرص المتاحة للاستثمار والتجارة والتطوير"
      icon="lightbulb"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا توجد فرص استثمارية حالياً."
      renderCard={(item: Opportunity) => (
        <Card className="h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-translate-y transition-all bg-white">
           <div className="position-relative bg-light" style={{ height: "200px" }}>
            {item.imageUrl ? (
              <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                 <span className="material-symbols-outlined fs-1 text-muted">handshake</span>
              </div>
            )}
            <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm fw-bold">
              فرصة متاحة
            </Badge>
          </div>
          <Card.Body className="p-4 d-flex flex-column">
            <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
            <Card.Text className="text-secondary small mb-4 line-clamp-3">{stripHtml(item.content)}</Card.Text>
            <div className="mt-auto d-flex align-items-center gap-2 text-muted small border-top pt-3">
              <span className="material-symbols-outlined fs-6">calendar_month</span> 
              <span>تاريخ الطرح: {formatDate(item.createdAt)}</span>
            </div>
          </Card.Body>
        </Card>
      )}
    />
  );
}