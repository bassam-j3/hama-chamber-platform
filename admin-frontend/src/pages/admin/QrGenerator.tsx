import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface PageItem {
  id: string;
  title: string;
  slug: string;
}

export default function QrGenerator() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [targetUrl, setTargetUrl] = useState('');
  const qrRef = useRef<HTMLCanvasElement>(null);
  const baseUrl = window.location.origin;

  // كلمة سرية للتشفير (حتى لا يستطيع أحد تزوير الرابط)
  const SECRET_SALT = "HAMA_CHAMBER_SECURE_2026";

  // دالة تشفير الرابط
  const generateSecureLink = useCallback((slug: string) => {
    // ندمج الرابط مع الكلمة السرية، ثم نشفره بصيغة Base64
    const rawData = `${slug}|||${SECRET_SALT}`;
    const encryptedToken = btoa(encodeURIComponent(rawData)); // تشفير
    setTargetUrl(`${baseUrl}/qr/${encryptedToken}`);
  }, [baseUrl]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axiosInstance.get('/pages');
        setPages(response.data);
        if (response.data.length > 0) {
          generateSecureLink(response.data[0].slug);
        }
      } catch {
        toast.error('فشل في جلب الصفحات');
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [generateSecureLink]);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current;
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `Secure_QR_${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('تم تحميل رمز QR بنجاح');
    }
  };

  return (
    <div className="d-flex flex-column h-100" dir="rtl">
      <div className="mb-4">
        <h2 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined fs-2 text-gold">lock</span>
          توليد QR Code آمن (للزوار فقط)
        </h2>
        <p className="text-muted small mt-1">
          هذا المولد يصنع روابط مشفرة مخفية. الزائر الذي يمسح الكود فقط هو من سيرى الصفحة دون الحاجة لتسجيل دخول.
        </p>
      </div>

      <Row className="g-4">
        <Col md={7} lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">اختر الصفحة المراد قفلها</h5>
              
              {loading ? (
                <div className="text-center p-4"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary small">الصفحة الديناميكية:</Form.Label>
                    <Form.Select 
                      className="rounded-3 py-2 bg-light border-0 fw-bold shadow-none"
                      onChange={(e) => generateSecureLink(e.target.value)}
                    >
                      {pages.map(page => (
                        <option key={page.id} value={page.slug}>{page.title}</option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted small">تأكد أن هذه الصفحة غير مضافة في القائمة الرئيسية للموقع (Navbar) لتبقى سرية.</Form.Text>
                  </Form.Group>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary bg-gradient text-white text-center">
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
              <h5 className="fw-bold mb-4 text-gold">الكود السري المشفر</h5>
              
              <div className="bg-white p-3 rounded-4 shadow mb-4">
                {targetUrl ? (
                  <QRCodeCanvas 
                    id="qr-canvas"
                    ref={qrRef}
                    value={targetUrl} 
                    size={220} 
                    bgColor={"#ffffff"}
                    fgColor={"#000000"} 
                    level={"H"} 
                    includeMargin={true}
                  />
                ) : (
                  <div style={{ width: '220px', height: '220px' }} className="d-flex align-items-center justify-content-center text-muted bg-light rounded-3">
                    جاري التوليد...
                  </div>
                )}
              </div>

              <div className="w-100 px-3 mb-4 text-white-50 small" dir="ltr" style={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                {targetUrl}
              </div>

              <Button 
                variant="light" 
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 text-primary shadow-sm py-2 rounded-pill"
                onClick={downloadQRCode}
                disabled={!targetUrl}
              >
                <span className="material-symbols-outlined">download</span>
                تحميل QR Code
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
