import React from 'react';
import { Container, Row, Col, Button, Placeholder } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface ColProps { lg?: number; md?: number; sm?: number; xs?: number; }

interface SectionPageTemplateProps<T> {
  title: string;
  description: string;
  icon?: string;
  items: T[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyMessage?: string;
  emptyIcon?: string;
  renderCard: (item: T) => React.ReactNode;
  skeletonCount?: number;
  colProps?: ColProps;
}

export default function SectionPageTemplate<T>({
  title, description, icon, items, isLoading, error, onRetry,
  emptyMessage = "لا توجد بيانات حالياً.", emptyIcon = "inbox",
  renderCard, skeletonCount = 6, colProps = { lg: 4, md: 6, sm: 12 }
}: SectionPageTemplateProps<T>) {
  const navigate = useNavigate();

  return (
    <div className="py-5" style={{ backgroundColor: '#f9fafc', minHeight: '100vh' }} dir="rtl">
      <Container>
        <div className="mb-5 text-center position-relative">
          <Button variant="link" className="position-absolute top-0 end-0 text-decoration-none fw-bold d-none d-md-flex align-items-center gap-2 text-secondary hover-text-primary" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined">arrow_forward</span> العودة للرئيسية
          </Button>
          
          {icon && (
            <div className="mb-3">
              <span className="material-symbols-outlined text-primary p-3 bg-primary bg-opacity-10 rounded-circle" style={{ fontSize: '40px' }}>{icon}</span>
            </div>
          )}
          <h1 className="fw-bold text-primary mb-3">{title}</h1>
          <p className="text-secondary fs-5">{description}</p>
        </div>

        {error && !isLoading && (
          <div className="text-center py-5">
             <span className="material-symbols-outlined text-danger fs-1 mb-3">error</span>
             <h5 className="text-danger mb-4">{error}</h5>
             <Button variant="outline-primary" className="rounded-pill px-4 fw-bold" onClick={onRetry}>إعادة المحاولة</Button>
          </div>
        )}

        {isLoading && (
           <Row className="g-4">
             {[...Array(skeletonCount)].map((_, idx) => (
                <Col {...colProps} key={idx}>
                  <div className="card h-100 border-0 rounded-4 shadow-sm">
                    <Placeholder as="div" animation="glow" style={{ height: "180px" }} className="w-100 bg-light rounded-top" />
                    <div className="card-body p-4">
                      <Placeholder as="h5" animation="glow" className="mb-3"><Placeholder xs={8} /></Placeholder>
                      <Placeholder as="p" animation="glow"><Placeholder xs={12} /><Placeholder xs={8} /></Placeholder>
                    </div>
                  </div>
                </Col>
             ))}
           </Row>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm border border-light">
             <span className="material-symbols-outlined fs-1 mb-3 opacity-50">{emptyIcon}</span>
             <h5>{emptyMessage}</h5>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <Row className="g-4">
            {items.map((item, index) => (
              <Col {...colProps} key={index}>
                {renderCard(item)}
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}