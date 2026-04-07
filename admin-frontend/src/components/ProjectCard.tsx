import { Card, Badge } from 'react-bootstrap';
import { formatDate, stripHtml } from '../utils/format';
import type { Project } from '../types/public';

interface ProjectCardProps {
  item: Project;
  onClick: (item: Project) => void;
}

export default function ProjectCard({ item, onClick }: ProjectCardProps) {
  return (
    <Card 
      className="h-100 border border-light rounded-4 overflow-hidden hover-translate-y hover-shadow-lg transition-all group bg-white cursor-pointer" 
      onClick={() => onClick(item)}
      style={{ cursor: 'pointer' }}
    >
      <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
        {item.imageUrl ? (
          <Card.Img 
            variant="top" 
            src={item.imageUrl} 
            className="w-100 h-100 object-fit-cover transition-all group-hover-scale" 
            alt={item.title}
          />
        ) : (
          <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
             <span className="material-symbols-outlined fs-1">business_center</span>
          </div>
        )}
        <Badge bg="success" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-2 shadow bg-opacity-90 fw-normal">
          مشروع تنموي
        </Badge>
      </div>
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
          <span className="material-symbols-outlined fs-6">calendar_today</span> 
          <span className="fw-medium">{formatDate(item.createdAt)}</span>
        </div>
        <Card.Title className="h5 fw-bold mb-3 lh-base text-dark group-hover-text-primary transition-all line-clamp-2">
          {item.title}
        </Card.Title>
        <Card.Text className="text-secondary small line-clamp-3 mb-4">
          {stripHtml(item.content)}
        </Card.Text>
        <div className="mt-auto text-primary fw-bolder text-decoration-none d-inline-flex align-items-center gap-2 border-bottom border-primary border-opacity-25 pb-1 align-self-start">
          تفاصيل المشروع <span className="material-symbols-outlined fs-6">arrow_back</span>
        </div>
      </Card.Body>
    </Card>
  );
}