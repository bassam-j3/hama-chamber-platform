import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import type { BoardMember } from '../types/public';

export default function PublicBoardMembers() {
  const [data, setData] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/board-members');
      setData(response.data.filter((i: BoardMember) => i.isActive));
    } catch (err) {
      setError('تعذر تحميل بيانات أعضاء المجلس.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="أعضاء مجلس الإدارة"
      description="تعرف على الهيكل الإداري لغرفة تجارة حماة"
      icon="groups"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا يوجد أعضاء مضافين حالياً."
      colProps={{ lg: 3, md: 4, sm: 6, xs: 12 }} // 👈 عرض 4 بطاقات في السطر للكمبيوتر
      renderCard={(item: BoardMember) => (
        <Card className="h-100 border-0 rounded-4 shadow-sm text-center hover-translate-y transition-all bg-white p-3">
          <div className="mx-auto mt-3 mb-3 overflow-hidden rounded-circle border border-3 border-primary shadow-sm" style={{ width: '130px', height: '130px' }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                <span className="material-symbols-outlined fs-1 text-muted">person</span>
              </div>
            )}
          </div>
          <Card.Body className="p-2">
            <Card.Title className="h5 fw-bold text-dark mb-1">{item.name}</Card.Title>
            <Card.Text className="text-primary fw-bold small">{item.roleTitle}</Card.Text>
          </Card.Body>
        </Card>
      )}
    />
  );
}