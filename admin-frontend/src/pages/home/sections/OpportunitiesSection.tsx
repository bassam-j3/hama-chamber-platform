import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Opportunity } from "../../../types/public";
import OpportunityCard from "../../../components/OpportunityCard";

interface OpportunitiesSectionProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (item: Opportunity) => void;
}

export default function OpportunitiesSection({ opportunities, onSelectOpportunity }: OpportunitiesSectionProps) {
  if (!opportunities || opportunities.length === 0) return null;
  
  return (
    <section id="opportunities" className="py-5 bg-white" dir="rtl">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <div>
            <h2 className="h2 fw-bold text-primary d-flex align-items-center gap-3 mb-2">
              <span className="bg-gold d-inline-block rounded-pill" style={{ width: "40px", height: "6px" }} />
              الفرص الاستثمارية والمناقصات
            </h2>
            <p className="text-secondary mb-0 fs-5">أهم الفرص المتاحة للاستثمار والتجارة والتطوير</p>
          </div>
          <Link to="/opportunities" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 hover-scale transition-all">
            عرض كل الفرص <span className="material-symbols-outlined fs-5">arrow_back</span>
          </Link>
        </div>

        <Row className="g-4">
          {opportunities.slice(0, 3).map((item) => (
            <Col lg={4} md={6} sm={12} key={item.id}>
              {/* 👇 هنا تم الإصلاح: تمرير الدالة لفتح النافذة بدلاً من التوجيه 👇 */}
              <OpportunityCard item={item} onClick={onSelectOpportunity} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}