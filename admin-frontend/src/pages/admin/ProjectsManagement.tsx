// src/pages/admin/ProjectsManagement.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string; title: string; content: string; imageUrl: string; isActive: boolean; createdAt: string;
}

const isVideo = (url: string | null) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

export default function ProjectsManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try { 
      const response = await axiosInstance.get("/projects"); 
      setProjects(response.data); 
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/projects/${itemToDelete}`);
      setProjects(projects.filter(p => p.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); } finally { setIsDeleting(false); }
  };

  return (
    <Container fluid className="max-w-75">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">domain</span>
                  <h4 className="text-primary fw-bold mb-0">مشاريع الغرفة</h4>
                </div>
                
                {/* --- زر الإضافة يأخذنا لصفحة الفورم الجديدة --- */}
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/projects/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة مشروع جديد
                </Button>
              </div>

              {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
              : projects.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد مشاريع مضافة حالياً</h5></div>) 
              : (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace">الوسائط</th>
                      <th className="text-secondary font-monospace text-start">عنوان المشروع</th>
                      <th className="text-secondary font-monospace">تاريخ النشر</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <div className="rounded overflow-hidden mx-auto bg-light border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '40px' }}>
                            {project.imageUrl ? (
                              isVideo(project.imageUrl) ? (
                                <div className="text-danger d-flex align-items-center justify-content-center w-100 h-100 bg-dark">
                                  <span className="material-symbols-outlined text-white fs-4">play_circle</span>
                                </div>
                              ) : (
                                <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )
                            ) : (
                              <span className="material-symbols-outlined text-muted mt-1">image</span>
                            )}
                          </div>
                        </td>
                        <td className="fw-bold text-dark text-start">{project.title}</td>
                        <td>{new Date(project.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td>
                          {project.isActive ? <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">منشور</Badge> : <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">مسودة</Badge>}
                        </td>
                        <td>
                          {/* --- زر التعديل يأخذنا لصفحة الفورم مع تمرير البيانات --- */}
                          <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/projects/edit/${project.id}`, { state: { projectItem: project } })}>
                            تعديل
                          </Button>
                          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(project.id); setShowDeleteModal(true); }}>
                            حذف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-2">warning</span>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد من رغبتك في حذف هذا المشروع بشكل نهائي؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" className="fw-bold px-4" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>إلغاء</Button>
          <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? "جاري الحذف..." : "حذف المشروع"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}