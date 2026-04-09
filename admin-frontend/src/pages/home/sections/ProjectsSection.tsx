import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Project } from "../../../types/public";
import ProjectCard from "../../../components/ProjectCard";

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (item: Project) => void;
}

export default function ProjectsSection({ projects, onSelectProject }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="py-5 bg-light" dir="rtl">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <div>
            <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
              مشاريع الغرفة
            </h2>
            <p className="text-secondary mb-0 fs-5">أبرز المشاريع والمبادرات التنموية لغرفة تجارة حماة</p>
          </div>
          <Link to="/projects" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
            عرض كل المشاريع <span className="material-symbols-outlined fs-5">arrow_back</span>
          </Link>
        </div>
        
        <Row className="g-4">
          {projects.slice(0, 3).map((item) => (
            <Col lg={4} md={6} sm={12} key={item.id}>
              <ProjectCard item={item} onClick={onSelectProject} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}