// src/pages/RedirectToJobs.tsx
// توجيه الزائر إلى منصة فرص العمل على hamatrade.sy
import { useEffect } from 'react';

const JOBS_URL = 'https://hamatrade.sy/jobs';

export default function RedirectToJobs() {
  useEffect(() => {
    window.location.href = JOBS_URL;
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5 text-center">
      <p className="text-secondary mb-2">جاري التحويل إلى صفحة فرص العمل...</p>
      <a href={JOBS_URL} className="btn btn-primary rounded-3 fw-bold">
        الذهاب الآن إلى hamatrade.sy/jobs
      </a>
    </div>
  );
}
