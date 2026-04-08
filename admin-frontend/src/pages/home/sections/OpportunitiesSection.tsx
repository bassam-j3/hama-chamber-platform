import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { formatDate, stripHtml } from "../../../utils/format";
import type { Opportunity } from "../../../types/public";

export default function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities || opportunities.length === 0) return null;
  
  return (
    <section id="opportunities" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        <div className="mb-5">
          <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
            <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
            الفرص الاستثمارية والمناقصات
          </h2>
          <p className="text-secondary mb-0 fs-5">أهم الفرص المتاحة للاستثمار والتجارة والتطوير</p>
        </div>
        <Row className="g-4">
          {opportunities.slice(0, 3).map((item) => (
            /* 👈 تحديد واضح لتصرف العمود على كافة الشاشات */
            <Col xs={12} sm={6} lg={4} key={item.id}>
              <Card className="h-100 border-0 rounded-4 overflow-hidden shadow-sm hover-translate-y transition-all bg-white d-flex flex-column">
                 {/* 👈 استخدام نسبة العرض للارتفاع بدلاً من الارتفاع الثابت */}
                 <div className="position-relative bg-light w-100" style={{ aspectRatio: '16/9' }}>
                  {item.imageUrl ? (
                    <Card.Img variant="top" src={item.imageUrl} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                       <span className="material-symbols-outlined fs-1 text-muted">handshake</span>
                    </div>
                  )}
                  <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm fw-bold">
                    فرصة متاحة
                  </Badge>
                </div>
                {/* 👈 استخدام flex-grow-1 لملء الفراغ المتبقي */}
                <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                  <Card.Title className="h5 fw-bold text-dark mb-3 lh-base">{item.title}</Card.Title>
                  <Card.Text className="text-secondary small mb-4 line-clamp-3">{stripHtml(item.content)}</Card.Text>
                  
                  {/* 👈 استخدام mt-auto لدفع هذا العنصر لأسفل البطاقة دائماً */}
                  <div className="mt-auto d-flex align-items-center gap-2 text-muted small border-top pt-3">
                    <span className="material-symbols-outlined fs-6">calendar_month</span>
                    <span>تاريخ الطرح: {formatDate(item.createdAt)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}