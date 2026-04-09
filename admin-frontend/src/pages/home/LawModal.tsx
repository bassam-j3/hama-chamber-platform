import { Modal, Button, Badge } from 'react-bootstrap';
import { formatDate } from '../../utils/format';
import type { Law } from '../../types/public';

interface LawModalProps {
  law: Law | null;
  onClose: () => void;
}

export default function LawModal({ law, onClose }: LawModalProps) {
  if (!law) return null;

  return (
    <Modal show={!!law} onHide={onClose} size="lg" centered scrollable dir="rtl">
      <Modal.Header className="border-bottom-0 pb-0" closeButton />
      <Modal.Body className="p-4 pt-2">
        <div className="d-flex align-items-center gap-2 text-secondary small mb-3 fw-bold">
          <span className="material-symbols-outlined fs-5">calendar_today</span>
          <span>{formatDate(law.createdAt)}</span>
          <Badge bg="secondary" className="ms-auto rounded-pill px-3 py-2 fw-normal">قانون وتشريع</Badge>
        </div>
        <h3 className="fw-bold text-dark mb-4 lh-base">{law.title}</h3>
        <style>{`.modal-rich-text img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }`}</style>
        <div className="text-secondary lh-lg fs-6 modal-rich-text" dangerouslySetInnerHTML={{ __html: law.content }} />
        
        {law.fileUrl && (
          <div className="mt-4 pt-3 border-top">
            <Button variant="primary" href={law.fileUrl} target="_blank" className="rounded-pill px-4 fw-bold">
              تحميل الملف المرفق <span className="material-symbols-outlined fs-6 align-middle ms-1">download</span>
            </Button>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold hover-scale transition-all" onClick={onClose}>إغلاق</Button>
      </Modal.Footer>
    </Modal>
  );
}