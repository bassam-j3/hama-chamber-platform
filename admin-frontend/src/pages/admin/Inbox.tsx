import  { useState, useEffect } from 'react';
import { Card, Spinner, Button, Modal } from 'react-bootstrap';
import axiosInstance from '../../api/axiosInstance'; // تأكد من مسار الـ axios الخاص بك

// تعريف شكل الإيميل القادم من الباكند
interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  text: string;
  html: string;
  isUnread: boolean;
}

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // لفتح رسالة معينة
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showModal, setShowModal] = useState(false);

  // جلب الإيميلات من الباكند (الذي بدوره يجلبها من سيرفر الغرفة)
  const fetchEmails = async () => {
    setLoading(true);
    try {
      // نطلب آخر 15 رسالة من الـ API الخاص بنا
      const response = await axiosInstance.get('/emails/inbox?limit=15');
      setEmails(response.data);
      setError('');
    } catch (err) {
      setError('تعذر الاتصال بخدمة البريد الإلكتروني. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleOpenEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-2 text-gold">inbox</span>
            البريد الوارد
          </h2>
          <p className="text-muted small mt-1">يتم عرض أحدث الرسائل من بريد الغرفة الرسمي</p>
        </div>
        <Button 
          variant="light" 
          className="d-flex align-items-center gap-2 text-primary border-0 shadow-sm hover-bg-primary hover-text-white transition-all"
          onClick={fetchEmails}
          disabled={loading}
        >
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
          تحديث البريد
        </Button>
      </div>

      <Card className="border-0 shadow-sm flex-grow-1 rounded-4 overflow-hidden">
        <div className="bg-primary text-white p-3 d-flex align-items-center border-bottom border-gold" style={{ borderBottomWidth: '3px' }}>
          <span className="material-symbols-outlined me-2">mail</span>
          <h6 className="mb-0 fw-bold">الرسائل الأخيرة (SCS-NET Service)</h6>
        </div>

        <div className="p-0 overflow-auto custom-scrollbar" style={{ maxHeight: '65vh' }}>
          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center p-5 h-100">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3 small fw-bold">جاري الاتصال بسيرفر البريد وجلب الرسائل...</p>
            </div>
          ) : error ? (
            <div className="text-center p-5 text-danger fw-bold">
              <span className="material-symbols-outlined display-1 mb-3 opacity-50">error</span>
              <p>{error}</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <span className="material-symbols-outlined display-1 mb-3 opacity-25">drafts</span>
              <p>صندوق الوارد فارغ</p>
            </div>
          ) : (
            <div className="list-group list-group-flush" dir="rtl">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleOpenEmail(email)}
                  className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 border-bottom transition-all ${email.isUnread ? 'bg-light' : 'bg-white'}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${email.isUnread ? 'bg-gold text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ width: '45px', height: '45px' }}>
                    <span className="material-symbols-outlined">{email.isUnread ? 'mark_email_unread' : 'drafts'}</span>
                  </div>
                  
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className={`mb-0 text-truncate ${email.isUnread ? 'fw-bold text-primary' : 'text-dark'}`} style={{ maxWidth: '70%' }}>
                        {email.from}
                      </h6>
                      <small className="text-muted" dir="ltr">
                        {new Date(email.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <p className={`mb-0 text-truncate small ${email.isUnread ? 'fw-bold text-dark' : 'text-muted'}`}>
                      {email.subject}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* نافذة عرض تفاصيل الرسالة */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered dir="rtl">
        <Modal.Header closeButton className="bg-light border-bottom-0 pb-0">
          <Modal.Title className="text-primary fw-bold fs-5">قراءة الرسالة</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedEmail && (
            <>
              <div className="mb-4 pb-3 border-bottom">
                <h4 className="fw-bold text-dark mb-3">{selectedEmail.subject}</h4>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <div className="fw-bold small">{selectedEmail.from}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }} dir="ltr">
                      {new Date(selectedEmail.date).toLocaleString('ar-EG')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* عرض محتوى الإيميل بأمان */}
              <div 
                className="email-content bg-light p-4 rounded-3" 
                style={{ minHeight: '200px', overflowX: 'auto' }}
                dangerouslySetInnerHTML={{ __html: selectedEmail.html || `<p>${selectedEmail.text}</p>` }} 
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>إغلاق</Button>
          <Button variant="outline-primary" className="d-flex align-items-center gap-1">
            <span className="material-symbols-outlined fs-6">reply</span> رد
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}