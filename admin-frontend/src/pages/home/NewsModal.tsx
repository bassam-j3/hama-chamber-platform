import { Modal, Button, Badge } from "react-bootstrap";
import type { News } from "../../types/public";

interface NewsModalProps {
  news: News | null;
  onClose: () => void;
}

export default function NewsModal({ news, onClose }: NewsModalProps) {
  return (
    <Modal show={!!news} onHide={onClose} size="lg" centered scrollable>
      {news && (
        <Modal.Body className="p-0 rounded-4 overflow-hidden border-0">
          {news.imageUrl && (
            <div className="position-relative bg-dark" style={{ height: "350px" }}>
              <img src={news.imageUrl} alt="" className="w-100 h-100 object-fit-cover" />
              <Button variant="light" className="position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow d-flex" onClick={onClose}><span className="material-symbols-outlined">close</span></Button>
            </div>
          )}
          <div className="p-5 bg-white">
            <Badge bg="gold" className="text-primary px-3 py-2 rounded-pill mb-3 shadow-sm">أخبار الغرفة</Badge>
            <h2 className="fw-bold mb-4 text-dark lh-base">{news.title}</h2>
            <div className="text-secondary lh-lg fs-5" dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>
        </Modal.Body>
      )}
    </Modal>
  );
}
