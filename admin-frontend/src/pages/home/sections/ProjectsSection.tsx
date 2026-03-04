import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { isVideo } from "../../../utils/format";
import type { Project } from "../../../types/public";

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectsSection({ projects, onSelectProject }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-5 bg-white">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold text-primary mb-3">مشاريع وإنجازات الغرفة</h2>
          <div className="bg-gold mx-auto mb-4 rounded-pill" style={{ width: "80px", height: "6px" }} />
        </div>
        {projects.length === 0 ? (
          <div className="text-center text-muted">لا توجد مشاريع.</div>
        ) : (
          <Row className="g-4">
            {projects.map((project) => (
              <Col md={6} lg={4} key={project.id}>
                <Card className="h-100 shadow-sm border border-light rounded-4 overflow-hidden transition-all hover-translate-y group bg-light bg-opacity-50">
                  <div className="bg-dark position-relative overflow-hidden" style={{ height: "240px" }}>
                    {project.imageUrl ? (
                      isVideo(project.imageUrl) ? (
                        <div className="w-100 h-100 position-relative">
                          <video src={project.imageUrl} className="w-100 h-100 object-fit-cover opacity-75 group-hover-scale transition-all" />
                          <div className="position-absolute top-50 start-50 translate-middle text-white bg-primary bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: "60px", height: "60px" }}><span className="material-symbols-outlined fs-1">play_arrow</span></div>
                        </div>
                      ) : <img src={project.imageUrl} alt="" className="w-100 h-100 object-fit-cover group-hover-scale transition-all" />
                    ) : <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary bg-light"><span className="material-symbols-outlined display-1">domain</span></div>}
                  </div>
                  <Card.Body className="p-4 d-flex flex-column">
                    <Card.Title className="h5 fw-bold text-dark mb-3 lh-base group-hover-text-primary transition-all">{project.title}</Card.Title>
                    <div className="text-secondary line-clamp-3 mb-4 small" dangerouslySetInnerHTML={{ __html: project.content }} />
                    <Button variant="light" className="text-primary fw-bold w-100 rounded-3 mt-auto py-2 border hover-bg-primary transition-all shadow-sm" onClick={() => onSelectProject(project)}>اقرأ التفاصيل</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
