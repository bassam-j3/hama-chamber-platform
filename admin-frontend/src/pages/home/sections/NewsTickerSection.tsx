import { useMemo } from 'react';
import type { News } from '../../../types/public';

interface NewsTickerProps {
  news: News[];
  dollarPrice?: string; // 👈 استقبال سعر الدولار
  goldPrice?: string;   // 👈 استقبال سعر الذهب
}

export default function NewsTickerSection({ news, dollarPrice, goldPrice }: NewsTickerProps) {
  
  // فلترة الأخبار لآخر 24 ساعة فقط
  const recentNews = useMemo(() => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return news.filter((item) => {
      const newsDate = new Date(item.createdAt);
      return newsDate >= twentyFourHoursAgo && item.isActive;
    });
  }, [news]);

  return (
    <div className="bg-ticker text-white py-2 border-bottom border-gold shadow-sm" dir="rtl">
      <div className="container-fluid">
        <div className="row align-items-center flex-nowrap overflow-hidden">
          
          <div className="col-auto bg-gold text-primary fw-bold px-3 py-1 rounded-start-pill z-1 shadow-sm d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-5 animate-pulse">trending_up</span>
            مؤشرات وأخبار
          </div>
          
          <div className="col ticker-wrap border-0">
            <div className="ticker-move d-flex gap-5 align-items-center pe-4" style={{ animationDuration: '30s' }}>
              
              {/* 👇 عرض الأسعار القادمة من الباكند (أو "غير متوفر" في حال عدم جلبها) */}
              <span className="text-warning fw-bold d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">payments</span>
                سعر صرف الدولار: <span className="ms-1 font-monospace">{dollarPrice || "---"}</span> ل.س
              </span>
              <span className="text-warning fw-bold d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">monetization_on</span>
                غرام الذهب (عيار 21): <span className="ms-1 font-monospace">{goldPrice || "---"}</span> ل.س
              </span>
              
              {/* عرض أخبار آخر 24 ساعة فقط */}
              {recentNews.length > 0 ? (
                recentNews.map((item) => (
                  <span key={item.id} className="text-light d-flex align-items-center gap-2">
                    <span className="text-gold">|</span>
                    <span className="material-symbols-outlined fs-6 text-danger animate-pulse">campaign</span>
                    {item.title}
                  </span>
                ))
              ) : (
                <span className="text-white-50 small d-flex align-items-center gap-2">
                  <span className="text-gold">|</span>
                  لا توجد أخبار عاجلة في آخر 24 ساعة.
                </span>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}