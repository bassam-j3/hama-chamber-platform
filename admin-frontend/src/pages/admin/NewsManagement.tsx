// src/pages/admin/NewsManagement.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface News { id: string; title: string; content: string; imageUrl: string; isActive: boolean; createdAt: string; }

export default function NewsManagement() {
  const navigate = useNavigate();

  // --- States for Prices ---
  const [dollarPrice, setDollarPrice] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");

  // --- States for News List ---
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [newsRes, pricesRes] = await Promise.all([
        axiosInstance.get("/news"),
        axiosInstance.get("/prices")
      ]);
      setNews(newsRes.data);
      if (pricesRes.data) {
        setDollarPrice(pricesRes.data.dollarPrice);
        setGoldPrice(pricesRes.data.gold21Price);
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Handle Prices Save
  const handleSavePrices = async () => {
    setIsSavingPrices(true);
    try {
      await axiosInstance.put("/prices", { dollarPrice, gold21Price: goldPrice });
      setPriceMessage("تم تحديث أسعار السوق بنجاح!");
      setTimeout(() => setPriceMessage(""), 3000);
    } catch (error) {
      setPriceMessage("حدث خطأ في التحديث.");
    } finally { setIsSavingPrices(false); }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axiosInstance.delete(`/news/${itemToDelete}`);
      setNews(news.filter(n => n.id !== itemToDelete));
      setShowDeleteModal(false); setItemToDelete(null);
    } catch (error) { console.error(error); }
  };

  return (
    <Container fluid className="max-w-75">
      {/* 1. قسم تحديث أسعار السوق */}
      <Card className="shadow-sm border-0 rounded-4 mb-4 bg-primary text-white" style={{ background: 'linear-gradient(135deg, #0a4d44 0%, #06302a 100%)' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-gold fs-3">monitoring</span>
            <h5 className="fw-bold mb-0 text-gold">تحديث أسعار السوق (للشريط الإخباري)</h5>
          </div>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label className="fw-bold small">سعر الدولار الأمريكي (ل.س)</Form.Label>
              <Form.Control type="text" value={dollarPrice} onChange={(e) => setDollarPrice(e.target.value)} placeholder="مثال: 14,500" className="fw-bold text-primary" />
            </Col>
            <Col md={5}>
              <Form.Label className="fw-bold small">سعر الذهب عيار 21 (ل.س)</Form.Label>
              <Form.Control type="text" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} placeholder="مثال: 1,150,000" className="fw-bold text-primary" />
            </Col>
            <Col md={2}>
              <Button variant="warning" className="w-100 fw-bold" onClick={handleSavePrices} disabled={isSavingPrices}>
                {isSavingPrices ? "جاري الحفظ..." : "حفظ الأسعار"}
              </Button>
            </Col>
          </Row>
          {priceMessage && <div className="mt-3 text-warning fw-bold">{priceMessage}</div>}
        </Card.Body>
      </Card>

      {/* 2. قسم عرض الأخبار */}
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary fs-2">newspaper</span>
                  <h4 className="text-primary fw-bold mb-0">أخبار وأنشطة الغرفة</h4>
                </div>
                
                {/* --- التوجيه لصفحة الإضافة الجديدة المستقلة --- */}
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/news/create')} className="fw-bold px-3 d-flex align-items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined fs-6">add</span> إضافة خبر جديد
                </Button>
              </div>

              {isLoading ? ( <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>) 
              : news.length === 0 ? (<div className="text-center p-5 text-muted"><span className="material-symbols-outlined fs-1 mb-2">inbox</span><h5>لا يوجد أخبار مضافة</h5></div>) 
              : (
                <Table responsive hover className="align-middle text-center border-top">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary font-monospace">صورة الخبر</th>
                      <th className="text-secondary font-monospace text-start">عنوان الخبر</th>
                      <th className="text-secondary font-monospace">التاريخ</th>
                      <th className="text-secondary font-monospace">الحالة</th>
                      <th className="text-secondary font-monospace">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((n) => (
                      <tr key={n.id}>
                        <td>
                          <div className="rounded overflow-hidden bg-light border d-flex align-items-center justify-content-center mx-auto" style={{ width: '60px', height: '60px' }}>
                            {n.imageUrl ? <img src={n.imageUrl} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="material-symbols-outlined text-muted">image</span>}
                          </div>
                        </td>
                        <td className="fw-bold text-dark text-start">{n.title}</td>
                        <td>{new Date(n.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td>{n.isActive ? <Badge bg="success" className="px-3 rounded-pill shadow-sm">منشور</Badge> : <Badge bg="secondary" className="px-3 rounded-pill shadow-sm">مخفي</Badge>}</td>
                        <td>
                          {/* --- التوجيه لصفحة التعديل المستقلة مع تمرير البيانات --- */}
                          <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => navigate(`/admin/news/edit/${n.id}`, { state: { newsItem: n } })}>
                            تعديل
                          </Button>
                          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => { setItemToDelete(n.id); setShowDeleteModal(true); }}>
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
        <Modal.Body className="fs-6 text-secondary pt-3 pb-4 px-4">هل أنت متأكد أنك تريد حذف هذا الخبر نهائياً من قاعدة البيانات؟</Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-light rounded-bottom d-flex gap-2 p-3">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} className="px-4 fw-bold">إلغاء</Button>
          <Button variant="danger" onClick={confirmDelete} className="px-4 fw-bold shadow-sm">حذف نهائي</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}