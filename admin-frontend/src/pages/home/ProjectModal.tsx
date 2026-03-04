import { Modal, Button, Badge } from "react-bootstrap";
import { isVideo } from "../../utils/format";
import type { Project } from "../../types/public";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <Modal show={!!project} onHide={onClose} size="lg" centered scrollable>
      {project && (
        <Modal.Body className="p-0 rounded-4 overflow-hidden border-0">
          <div className="position-relative bg-dark" style={{ height: "350px" }}>
            {project.imageUrl && (
              isVideo(project.imageUrl) ? (
                <video src={project.imageUrl} controls className="w-100 h-100 object-fit-cover" />
              ) : (
                <img src={project.imageUrl} alt="" className="w-100 h-100 object-fit-cover" />
              )
            )}
            <Button variant="light" className="position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow d-flex" onClick={onClose}><span className="material-symbols-outlined">close</span></Button>
          </div>
          <div className="p-5 bg-white">
            <Badge bg="primary" className="px-3 py-2 rounded-pill mb-3 shadow-sm">تفاصيل المشروع</Badge>
            <h2 className="fw-bold mb-4 text-dark lh-base">{project.title}</h2>
            <div className="text-secondary lh-lg fs-5" dangerouslySetInnerHTML={{ __html: project.content }} />
          </div>
        </Modal.Body>
      )}
    </Modal>
  );
}
