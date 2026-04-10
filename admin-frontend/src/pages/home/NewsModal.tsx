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
      size="lg" 
      centered 
      scrollable 
      dir="rtl"
      fullscreen="sm-down"
    >
      <Modal.Header className="border-bottom-0 pb-0" closeButton>
      </Modal.Header>
      
      <Modal.Body className="p-3 p-md-4 pt-2">
        {/* صورة الخبر إن وجدت */}
        {news.imageUrl && (
          <div className="text-center mb-3 mb-md-4 rounded-4 overflow-hidden shadow-sm bg-light" style={{ maxHeight: '450px' }}>
            <img src={news.imageUrl} alt={news.title} className="img-fluid w-100 h-100 object-fit-contain" />
          </div>
        )}
        
        <div className="d-flex align-items-center gap-2 text-primary small mb-2 mb-md-3 fw-bold">
          <span className="material-symbols-outlined fs-5">calendar_today</span>
          <span>{formatDate(news.createdAt)}</span>
          <Badge bg="primary" className="ms-auto rounded-pill px-3 py-2 fw-normal">أخبار الغرفة</Badge>
        </div>
        
        <h3 className="fw-bold text-dark mb-3 mb-md-4 lh-base h4 h3-md">{news.title}</h3>
        
        <style>
          {`
            .modal-rich-text img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 10px 0;
            }
            .modal-rich-text {
              word-break: break-word;
            }
          `}
        </style>
        <div 
          className="text-secondary lh-lg fs-6 modal-rich-text" 
          dangerouslySetInnerHTML={{ __html: news.content }} 
        />
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold hover-scale transition-all w-100 w-md-auto" onClick={onClose}>
          إغلاق
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
