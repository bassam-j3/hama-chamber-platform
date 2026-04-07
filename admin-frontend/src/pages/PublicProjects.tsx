import { useState, useEffect } from 'react';
import { Container, Row, Col, Placeholder, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import type { Project } from '../types/public';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from './home/ProjectModal';

export default function PublicProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/projects');
      setProjects(response.data.filter((p: Project) => p.isActive));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('تعذر تحميل المشاريع. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  return (
    <div className="py-5" style={{ backgroundColor: '#f9fafc', minHeight: '100vh' }} dir="rtl">
      <Container>
        <div className="mb-5 text-center position-relative">
          <Button 
            variant="link" 
            className="position-absolute top-0 end-0 text-decoration-none fw-bold d-none d-md-flex align-items-center gap-2 text-secondary"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined">arrow_forward</span> العودة للرئيسية
          </Button>

          <h1 className="fw-bold text-primary mb-3">المشاريع التنموية والاقتصادية</h1>
          <p className="text-secondary fs-5">تعرف على أهم المشاريع والمبادرات التي تديرها وتدعمها الغرفة</p>
        </div>

        {error && !loading && (
          <div className="text-center py-5">
             <span className="material-symbols-outlined text-danger fs-1 mb-3">error</span>
             <h5 className="text-danger mb-4">{error}</h5>
             <Button variant="outline-primary" className="rounded-pill px-4" onClick={fetchProjects}>إعادة المحاولة</Button>
          </div>
        )}

        {loading && (
           <Row className="g-4">
             {[...Array(6)].map((_, idx) => (
                <Col lg={4} md={6} key={idx}>
                  <div className="card h-100 border-0 rounded-4 shadow-sm">
                    <Placeholder as="div" animation="glow" style={{ height: "240px" }} className="w-100 bg-light rounded-top" />
                    <div className="card-body p-4">
                      <Placeholder as="p" animation="glow" className="mb-3"><Placeholder xs={4} size="sm" /></Placeholder>
                      <Placeholder as="h5" animation="glow" className="mb-3"><Placeholder xs={8} /><Placeholder xs={6} /></Placeholder>
                      <Placeholder as="p" animation="glow"><Placeholder xs={12} /><Placeholder xs={12} /><Placeholder xs={8} /></Placeholder>
                    </div>
                  </div>
                </Col>
             ))}
           </Row>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm">
             <span className="material-symbols-outlined fs-1 mb-3 opacity-50">business_center</span>
             <h5>لا توجد مشاريع منشورة حالياً.</h5>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <Row className="g-4">
            {projects.map((item) => (
              <Col lg={4} md={6} sm={12} key={item.id}>
                <ProjectCard item={item} onClick={setSelectedProject} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}