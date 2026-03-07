import { useState, useEffect, useRef } from "react";
import { Container, Card, Button, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../api/axiosInstance";
import { QRCodeSVG } from 'qrcode.react';

interface PageItem { id: string; title: string; slug: string; isActive: boolean; isSecure: boolean; createdAt: string; }

export default function PagesManagement() {
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // حالات حذف الصفحة
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // حالات عرض الـ QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrPage, setSelectedQrPage] = useState<{slug: string, title: string} | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axiosInstance.get("/pages");
        setPages(res.data);
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    };
    fetchPages();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axiosInstance.delete(`/pages/${itemToDelete}`);
      setPages(pages.filter(p => p.id !== itemToDelete));
      setShowDeleteModal(false);
    } catch (error) { console.error(error); }
  };

  const handleShowQR = (page: PageItem) => {
    setSelectedQrPage({ slug: page.slug, title: page.title });
    setShowQrModal(true);
  };

  return (
    <Container fluid className="max-w-75">
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-primary fs-2">layers</span>
              <h4 className="text-primary fw-bold mb-0">إدارة الصفحات الديناميكية</h4>
            </div>
            <Button variant="primary" onClick={() => navigate('/admin/pages/create')} className="fw-bold px-3 d-flex align-items-center gap-1">
              <span className="material-symbols-outlined fs-6">add</span> إنشاء صفحة جديدة
            </Button>
          </div>

          {isLoading ? <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div> : pages.length === 0 ? (
            <div className="text-center p-5 text-muted"><h5>لا توجد صفحات مضافة</h5></div>
          ) : (
            <Table responsive hover className="align-middle text-center border-top">
              <thead className="table-light">
                <tr>
                  <th className="text-start">عنوان الصفحة</th>
                  <th>الرابط (Slug)</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold text-dark text-start">{p.title}</td>
                    <td dir="ltr" className="text-muted small">/page/{p.slug}</td>
                    
                    {/* 👇 تمييز النوع في لوحة التحكم */}
                    <td>
                      {p.isSecure ? 
                        <Badge bg="danger" className="px-3 rounded-pill d-inline-flex gap-1 align-items-center"><span className="material-symbols-outlined" style={{fontSize: '12px'}}>qr_code</span> محمية بـ QR</Badge> : 
                        <Badge bg="info" className="px-3 rounded-pill text-dark d-inline-flex gap-1 align-items-center"><span className="material-symbols-outlined" style={{fontSize: '12px'}}>public</span> عامة</Badge>
                      }
                    </td>

                    <td>{p.isActive ? <Badge bg="success" className="px-3 rounded-pill">منشورة</Badge> : <Badge bg="secondary" className="px-3 rounded-pill">مخفية</Badge>}</td>
                    
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {/* 👈 زر المعاينة المباشرة (يفتح الصفحة في تبويب جديد) */}
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => window.open(`/page/${p.slug}`, '_blank')} 
                          title="معاينة الصفحة"
                        >
                          <span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                        </Button>

                        {/* زر عرض الـ QR للصفحات المحمية فقط */}
                        {p.isSecure && (
                          <Button variant="outline-dark" size="sm" onClick={() => handleShowQR(p)} title="عرض الـ QR">
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>qr_code_2</span>
                          </Button>
                        )}
                        <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admin/pages/edit/${p.id}`, { state: { pageItem: p } })}>تعديل</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => { setItemToDelete(p.id); setShowDeleteModal(true); }}>حذف</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal لطباعة الـ QR Code لاحقاً */}
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-primary">الرمز السري للصفحة</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pb-5">
          <h5 className="mb-4 text-dark">{selectedQrPage?.title}</h5>
          <div ref={qrRef} className="d-inline-block p-3 bg-white border rounded-4 shadow-sm">
             {selectedQrPage && <QRCodeSVG value={`${window.location.origin}/page/${selectedQrPage.slug}?passcode=HAMA2026`} size={200} level="H" />}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal تأكيد الحذف */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
         {/* ... (نفس مودال الحذف السابق) ... */}
         <Modal.Header><Modal.Title className="text-danger">تأكيد الحذف</Modal.Title></Modal.Header>
         <Modal.Body>هل أنت متأكد من حذف هذه الصفحة؟</Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>إلغاء</Button>
           <Button variant="danger" onClick={confirmDelete}>حذف</Button>
         </Modal.Footer>
      </Modal>
    </Container>
  );
}