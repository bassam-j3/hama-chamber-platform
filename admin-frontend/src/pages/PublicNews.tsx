import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import NewsCard from '../components/NewsCard';
import NewsModal from './home/NewsModal';
import type { News } from '../types/public';

export default function PublicNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/news');
      setNews(response.data.filter((n: News) => n.isActive));
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('تعذر تحميل الأخبار. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, []);

  return (
    <>
      <SectionPageTemplate
        title="أحدث الأخبار والتقارير"
        description="تابع آخر مستجدات وفعاليات غرفة تجارة حماة لحظة بلحظة"
        icon="newspaper"
        items={news}
        isLoading={loading}
        error={error}
        onRetry={fetchNews}
        emptyMessage="لا توجد أخبار منشورة حالياً."
        renderCard={(item: News) => (
          <NewsCard item={item} onClick={setSelectedNews} />
        )}
      />
      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
    </>
  );
}
