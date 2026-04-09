import { Modal, Button, Badge } from 'react-bootstrap';
import { formatDate } from '../../utils/format';
import type { Opportunity } from '../../types/public';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export default function OpportunityModal({ opportunity, onClose }: OpportunityModalProps) {
  if (!opportunity) return null;

  return (
    <Modal show={!!opportunity} onHide={onClose} size="lg" centered scrollable dir="rtl">
      <Modal.Header className="border-bottom-0 pb-0" closeButton />
      <Modal.Body className="p-4 pt-2">
        {opportunity.imageUrl && (
          <div className="text-center mb-4 rounded-4 overflow-hidden shadow-sm bg-light" style={{ maxHeight: '450px' }}>
            <img src={opportunity.imageUrl} alt={opportunity.title} className="img-fluid w-100 h-100 object-fit-contain" />
          </div>
        )}
        <div className="d-flex align-items-center gap-2 text-warning small mb-3 fw-bold">
          <span className="material-symbols-outlined fs-5 text-warning">calendar_today</span>
          <span className="text-dark">{formatDate(opportunity.createdAt)}</span>
          <Badge bg="warning" className="ms-auto rounded-pill px-3 py-2 fw-normal text-dark">فرصة متاحة</Badge>
        </div>
        <h3 className="fw-bold text-dark mb-4 lh-base">{opportunity.title}</h3>
        <style>
          {` .modal-rich-text img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; } `}
        </style>
        <div className="text-secondary lh-lg fs-6 modal-rich-text" dangerouslySetInnerHTML={{ __html: opportunity.content }} />
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold hover-scale transition-all" onClick={onClose}>إغلاق</Button>
      </Modal.Footer>
    </Modal>
  );
}