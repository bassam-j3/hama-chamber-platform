import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Project {
  id: string; title: string; content: string; imageUrl: string; isActive: boolean; createdAt: string;
}

const isVideo = (url: string | null) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

export default function ProjectsManagement() {
  console.log("PROJECTS_MANAGEMENT_V1.3.2");
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try { 
      const response = await axiosInstance.get("/projects");
      setProjects(response.data); 
    } catch { 
      setError("Failed to fetch projects");
      toast.error("Error loading projects");
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Archiving project...');
    try {
      await axiosInstance.delete(`/projects/${itemToDelete}`);
      setProjects(prev => prev.filter(p => p.id !== itemToDelete));
      toast.success('Project archived successfully', { id: toastId });
      setShowDeleteModal(false); 
      setItemToDelete(null);
    } catch { 
      toast.error('Failed to delete project', { id: toastId });
    } finally { 
      setIsDeleting(false); 
    }
  };

  return (
    <Container fluid className="max-w-75" dir="rtl">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">domain</span>
                  <h4 className="text-primary fw-bold mb-0">Projects Management</h4>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/admin/projects/create')} 
                  className="fw-bold px-4 d-flex align-items-center gap-2 shadow-sm rounded-pill"
                >
                  <span className="material-symbols-outlined">add</span> Add Project
                </Button>
              </div>

              {isLoading ? ( 
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
              ) : error ? (
                <div className="text-center p-5 text-danger bg-light rounded-4 border">
                  <span className="material-symbols-outlined fs-1 mb-2">error_outline</span>
                  <h5>{error}</h5>
                  <Button variant="outline-danger" size="sm" onClick={fetchProjects} className="mt-3 fw-bold px-4 rounded-pill">Retry</Button>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center p-5 text-muted bg-light rounded-4 border border-dashed">
                  <span className="material-symbols-outlined fs-1 mb-2 opacity-25">inbox</span>
                  <h5>No active projects</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle text-center border-top mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Media</th>
                        <th className="text-start">Title</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div className="rounded-3 overflow-hidden mx-auto bg-light border d-flex align-items-center justify-content-center shadow-sm" style={{ width: '70px', height: '45px' }}>
                              {project.imageUrl ? (
                                isVideo(project.imageUrl) ? (
                                  <div className="text-danger d-flex align-items-center justify-content-center w-100 h-100 bg-dark"><span className="material-symbols-outlined text-white fs-5">play_circle</span></div>
                                ) : (
                                  <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )
                              ) : (<span className="material-symbols-outlined text-muted mt-1">image</span>)}
                            </div>
                          </td>
                          <td className="fw-bold text-dark text-start">{project.title}</td>
                          <td className="text-muted small">{new Date(project.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm bg-opacity-75">Active</Badge>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="fw-bold rounded-pill px-3" 
                                    onClick={() => navigate(`/admin/projects/edit/${project.id}`, { state: { projectItem: project } })}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    className="fw-bold rounded-pill px-3" 
                                    onClick={() => { setItemToDelete(project.id); setShowDeleteModal(true); }}
                                >
                                    Delete
                                </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" dir="rtl">
        <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">
          Are you sure you want to delete this project?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm rounded-pill" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
