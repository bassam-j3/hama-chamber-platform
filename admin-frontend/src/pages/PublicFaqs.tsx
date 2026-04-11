import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import type { Faq } from '../types/public';

export default function PublicFaqs() {
  const [data, setData] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/faqs');
      setData(response.data.filter((i: Faq) => i.isActive));
    } catch {
      setError('تعذر تحميل الأسئلة الشائعة.');
    } finally { setLoading(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

  return (
    <SectionPageTemplate
      title="الأسئلة الشائعة (FAQ)"
      description="إجابات ومعلومات تهم التجار والمراجعين لغرفة تجارة حماة"
      icon="help_center"
      items={data}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
      emptyMessage="لا توجد أسئلة شائعة حالياً."
      colProps={{ lg: 12, md: 12, sm: 12 }} // 👈 عرض كل سؤال بعرض الشاشة كاملة
      renderCard={(item: Faq) => (
        <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary hover-shadow transition-all">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary fs-4">contact_support</span> 
            {item.question}
          </h5>
          <div className="text-secondary lh-lg ms-4 pe-2 border-end border-light border-2" dangerouslySetInnerHTML={{ __html: item.answer }} />
        </div>
      )}
    />
  );
}