import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Button, Modal, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import axiosInstance from '../../api/axiosInstance';

interface EmailListItem {
  id: string;
  subject: string;
  from: string;
  date: string;
  isUnread: boolean;
}

interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: string; // base64 data
}

interface EmailDetails extends EmailListItem {
  text: string;
  html: string;
  attachments?: EmailAttachment[];
}

export default function Inbox() {
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  
  // حالات قراءة رسالة
  const [selectedEmail, setSelectedEmail] = useState<EmailDetails | null>(null);
  const [showReadModal, setShowReadModal] = useState(false);

  // حالات إرسال رسالة جديدة (Compose)
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<FileList | null>(null);

  // جلب قائمة الإيميلات
  const fetchEmails = useCallback(async (folder = currentFolder) => {
    setLoadingList(true);
    try {
      const response = await axiosInstance.get(`/emails/list?folder=${folder}&limit=20`);
      setEmails(response.data);
      setError('');
    } catch {
      setError('تعذر تحميل الرسائل. يرجى التأكد من الاتصال.');
    } finally {
      setLoadingList(false);
    }
  }, [currentFolder]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  // تغيير المجلد
  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
    fetchEmails(folder);
  };

  // فتح الإيميل وتحديث حالته كـ مقروء
  const handleOpenEmail = async (emailItem: EmailListItem) => {
    setShowReadModal(true);
    setLoadingDetails(true);
    setSelectedEmail(null);
    setError('');

    try {
      const response = await axiosInstance.get(`/emails/inbox/${emailItem.id}`);
      setSelectedEmail(response.data);

      // تحديث الحالة فقط إذا كان الإيميل في صندوق الوارد وغير مقروء
      if (emailItem.isUnread && currentFolder === 'INBOX') {
        await axiosInstance.put(`/emails/inbox/${emailItem.id}/read`);
        setEmails(prev => prev.map(e => e.id === emailItem.id ? { ...e, isUnread: false } : e));
      }
    } catch {
      setError('حدث خطأ أثناء جلب تفاصيل الرسالة.');
      setShowReadModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // إرسال رسالة جديدة
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', composeTo);
      formData.append('subject', composeSubject);
      
      const htmlBody = `<div dir="rtl" style="font-family: sans-serif; font-size: 16px;">${composeBody.replace(/\n/g, '<br/>')}</div>`;
      formData.append('html', htmlBody);

      if (composeAttachments) {
        Array.from(composeAttachments).forEach(f => formData.append('attachments', f));
      }

      await axiosInstance.post('/emails/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setShowComposeModal(false);
      setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeAttachments(null);
      alert('تم إرسال الرسالة بنجاح! 🚀');
    } catch {
      alert('حدث خطأ أثناء إرسال الرسالة، تأكد من الإعدادات.');
    } finally {
      setSending(false);
    }
  };

  // زر الرد الذكي
  const handleReply = () => {
    if (selectedEmail) {
      setShowReadModal(false);
      setComposeTo(selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from);
      setComposeSubject(`Re: ${selectedEmail.subject}`);
      setComposeBody(`\n\n\n--- رداً على رسالتك ---\n${selectedEmail.text || ''}`);
      setShowComposeModal(true);
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary fw-bold mb-0 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-2 text-gold">mail</span>
            البريد الرسمي
          </h2>
          <p className="text-muted small mt-1">إدارة مراسلات الغرفة التجارية</p>
        </div>
        
        <div className="d-flex gap-2">
          <DropdownButton 
            title={
              <span className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined fs-5">
                  {currentFolder === 'INBOX' ? 'inbox' : currentFolder === 'SENT' ? 'send' : 'report'}
                </span>
                {currentFolder === 'INBOX' ? 'الوارد' : currentFolder === 'SENT' ? 'المرسل' : 'المزعجة'}
              </span>
            }
            variant="outline-primary"
            onSelect={(k) => handleFolderChange(k || 'INBOX')}
            className="shadow-sm"
          >
            <Dropdown.Item eventKey="INBOX" className="d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-6">inbox</span>البريد الوارد</Dropdown.Item>
            <Dropdown.Item eventKey="SENT" className="d-flex align-items-center gap-2"><span className="material-symbols-outlined fs-6">send</span>المرسل</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="SPAM" className="d-flex align-items-center gap-2 text-danger"><span className="material-symbols-outlined fs-6">report</span>الرسائل المزعجة (Spam)</Dropdown.Item>
          </DropdownButton>

          <Button variant="primary" onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeAttachments(null); setShowComposeModal(true); }} className="fw-bold px-4 d-flex align-items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined fs-5">edit_square</span>رسالة جديدة
          </Button>
          
          <Button variant="light" onClick={() => fetchEmails()} disabled={loadingList} className="d-flex align-items-center justify-content-center shadow-sm border-0 hover-bg-primary hover-text-white transition-all text-primary">
            <span className={`material-symbols-outlined ${loadingList ? 'animate-spin' : ''}`}>sync</span>
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm flex-grow-1 rounded-4 overflow-hidden">
        <div className={`text-white p-3 d-flex align-items-center border-bottom border-gold ${currentFolder === 'SPAM' ? 'bg-danger' : 'bg-primary'}`} style={{ borderBottomWidth: '3px' }}>
          <span className="material-symbols-outlined me-2">{currentFolder === 'INBOX' ? 'inbox' : currentFolder === 'SENT' ? 'send' : 'report'}</span>
          <h6 className="mb-0 fw-bold">الرسائل في {currentFolder === 'INBOX' ? 'الوارد' : currentFolder === 'SENT' ? 'المرسل' : 'المزعجة'}</h6>
        </div>

        <div className="p-0 overflow-auto custom-scrollbar" style={{ maxHeight: '65vh' }}>
          {loadingList ? (
            <div className="d-flex flex-column justify-content-center align-items-center p-5 h-100">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3 small fw-bold">جاري الاتصال بسيرفر البريد...</p>
            </div>
          ) : error ? (
             <div className="text-center p-5 text-danger fw-bold"><span className="material-symbols-outlined display-1 mb-3 opacity-50">error</span><p>{error}</p></div>
          ) : emails.length === 0 ? (
             <div className="text-center p-5 text-muted"><span className="material-symbols-outlined display-1 mb-3 opacity-25">drafts</span><p>المجلد فارغ</p></div>
          ) : (
            <div className="list-group list-group-flush" dir="rtl">
              {emails.map(email => (
                <button key={email.id} onClick={() => handleOpenEmail(email)} className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 border-bottom transition-all ${email.isUnread ? 'bg-light' : 'bg-white'}`}>
                  <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${email.isUnread ? 'bg-gold text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ width: '45px', height: '45px' }}>
                    <span className="material-symbols-outlined">{email.isUnread ? 'mark_email_unread' : 'drafts'}</span>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className={`mb-0 text-truncate ${email.isUnread ? 'fw-bold text-primary' : 'text-dark'}`} style={{ maxWidth: '70%' }}>{email.from}</h6>
                      <small className="text-muted" dir="ltr">{new Date(email.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                    <p className={`mb-0 text-truncate small ${email.isUnread ? 'fw-bold text-dark' : 'text-muted'}`}>{email.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 1️⃣ نافذة القراءة */}
      <Modal show={showReadModal} onHide={() => setShowReadModal(false)} size="xl" centered dir="rtl">
        <Modal.Header closeButton className="bg-light border-bottom-0 pb-0">
          <Modal.Title className="text-primary fw-bold fs-5">قراءة الرسالة</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {loadingDetails ? (
             <div className="d-flex flex-column justify-content-center align-items-center p-5"><Spinner animation="border" variant="primary" /><p className="text-muted mt-3 small fw-bold">جاري تحميل محتوى الرسالة...</p></div>
          ) : selectedEmail ? (
            <>
              <div className="mb-4 pb-3 border-bottom">
                <h4 className="fw-bold text-dark mb-3">{selectedEmail.subject}</h4>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><span className="material-symbols-outlined">person</span></div>
                  <div>
                    <div className="fw-bold small">{selectedEmail.from}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }} dir="ltr">{new Date(selectedEmail.date).toLocaleString('ar-EG')}</div>
                  </div>
                </div>
              </div>
              
              <div className="email-content bg-white p-0 rounded-3 border shadow-sm" style={{ minHeight: '400px', height: '50vh', overflow: 'hidden' }}>
                <iframe title="Email Content" srcDoc={selectedEmail.html || `<div style="font-family: sans-serif; padding: 15px; direction: rtl; white-space: pre-wrap;">${selectedEmail.text || 'لا يوجد محتوى'}</div>`} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin" />
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-top border-2 border-light">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark"><span className="material-symbols-outlined text-primary">attachment</span> المرفقات ({selectedEmail.attachments.length})</h6>
                  <div className="d-flex flex-wrap gap-3">
                    {selectedEmail.attachments.map((att, index) => (
                      <div key={index} className="border border-light rounded-4 p-2 d-flex align-items-center gap-3 bg-white shadow-sm" style={{ minWidth: '250px' }}>
                        <div className="bg-light rounded-3 p-2 text-primary d-flex align-items-center justify-content-center">
                          <span className="material-symbols-outlined fs-2">{att.contentType.includes('pdf') ? 'picture_as_pdf' : att.contentType.includes('image') ? 'image' : 'insert_drive_file'}</span>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-bold small text-truncate" title={att.filename}>{att.filename}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }} dir="ltr">{(att.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <Button variant="light" className="rounded-circle p-2 d-flex align-items-center justify-content-center text-primary border-0 shadow-sm" onClick={() => { const link = document.createElement('a'); link.href = `data:${att.contentType};base64,${att.content}`; link.download = att.filename; link.click(); }} title="تحميل"><span className="material-symbols-outlined fs-5">download</span></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <div className="text-center p-4 text-danger">فشل تحميل الرسالة</div>}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="secondary" onClick={() => setShowReadModal(false)}>إغلاق</Button>
          <Button variant="outline-primary" className="d-flex align-items-center gap-1" onClick={handleReply}><span className="material-symbols-outlined fs-6">reply</span> رد</Button>
        </Modal.Footer>
      </Modal>

      {/* 2️⃣ نافذة الإرسال */}
      <Modal show={showComposeModal} onHide={() => setShowComposeModal(false)} size="lg" centered dir="rtl" backdrop="static">
        <Form onSubmit={handleSendEmail}>
          <Modal.Header closeButton className="bg-primary text-white border-bottom-0 pb-3" style={{ borderBottomWidth: '3px', borderBottomColor: 'var(--bs-gold)', borderBottomStyle: 'solid' }}>
            <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2"><span className="material-symbols-outlined">edit_square</span> رسالة جديدة</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-light">
            <Card className="border-0 shadow-sm p-4 rounded-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary small">إلى</Form.Label>
                <Form.Control type="email" placeholder="example@domain.com" required value={composeTo} onChange={e => setComposeTo(e.target.value)} className="rounded-3 bg-light border-0 py-2" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary small">الموضوع</Form.Label>
                <Form.Control type="text" placeholder="عنوان الرسالة..." required value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="rounded-3 bg-light border-0 py-2" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary small">الرسالة</Form.Label>
                <Form.Control as="textarea" rows={8} placeholder="اكتب رسالتك هنا..." required value={composeBody} onChange={e => setComposeBody(e.target.value)} className="rounded-3 bg-light border-0 py-2 custom-scrollbar" />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-bold text-primary small d-flex align-items-center gap-1"><span className="material-symbols-outlined fs-6">attach_file</span> إرفاق ملفات</Form.Label>
                <Form.Control type="file" multiple onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComposeAttachments(e.target.files)} className="rounded-3 bg-light border-0" />
              </Form.Group>
            </Card>
          </Modal.Body>
          <Modal.Footer className="bg-light border-top-0 pt-0">
            <Button variant="secondary" className="rounded-3 px-4" onClick={() => setShowComposeModal(false)} disabled={sending}>إلغاء</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4 d-flex align-items-center gap-2 shadow-sm" disabled={sending}>
              {sending ? <Spinner animation="border" size="sm" /> : <span className="material-symbols-outlined fs-6">send</span>}
              {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}
