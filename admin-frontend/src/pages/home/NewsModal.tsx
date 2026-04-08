import { Modal, Button, Badge } from 'react-bootstrap';
import { formatDate } from '../../utils/format';
import type { News } from '../../types/public';

interface NewsModalProps {
  news: News | null;
  onClose: () => void;
}

export default function NewsModal({ news, onClose }: NewsModalProps) {
  if (!news) return null;

  return (
    <Modal 
      show={!!news} 
      onHide={onClose} 
      size="lg" // حجم كبير ليتناسب مع الشاشات المتجاوبة
      centered // توسيط النافذة
      scrollable // 👈 هذه الخاصية هي السحر! تسمح بالتمرير الداخلي إذا كان النص طويلاً
      dir="rtl"
    >
      <Modal.Header className="border-bottom-0 pb-0" closeButton>
      </Modal.Header>
      
      <Modal.Body className="p-4 pt-2">
        {/* صورة الخبر إن وجدت */}
        {news.imageUrl && (
          <div className="text-center mb-4 rounded-4 overflow-hidden shadow-sm bg-light" style={{ maxHeight: '450px' }}>
            <img src={news.imageUrl} alt={news.title} className="img-fluid w-100 h-100 object-fit-contain" />
          </div>
        )}
        
        <div className="d-flex align-items-center gap-2 text-primary small mb-3 fw-bold">
          <span className="material-symbols-outlined fs-5">calendar_today</span>
          <span>{formatDate(news.createdAt)}</span>
          <Badge bg="primary" className="ms-auto rounded-pill px-3 py-2 fw-normal">أخبار الغرفة</Badge>
        </div>
        
        <h3 className="fw-bold text-dark mb-4 lh-base">{news.title}</h3>
        
        {/* عرض المحتوى الكامل مع دعم الـ HTML (للحفاظ على التنسيق من المحرر)
          أضفنا ستايل مدمج لضمان عدم خروج أي صورة داخل النص عن حدود النافذة 
        */}
        <style>
          {`
            .modal-rich-text img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 10px 0;
            }
          `}
        </style>
        <div 
          className="text-secondary lh-lg fs-6 modal-rich-text" 
          dangerouslySetInnerHTML={{ __html: news.content }} 
        />
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold hover-scale transition-all" onClick={onClose}>
          إغلاق
        </Button>
      </Modal.Footer>
    </Modal>
  );
}