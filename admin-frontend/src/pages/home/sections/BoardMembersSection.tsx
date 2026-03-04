import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import type { BoardMember } from "../../../types/public";

interface BoardMembersSectionProps {
  members: BoardMember[];
}

export default function BoardMembersSection({ members }: BoardMembersSectionProps) {
  return (
    <section id="board-members" className="py-5 bg-secondary-cream">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold text-primary mb-3">أعضاء مجلس الإدارة</h2>
          <div className="bg-gold mx-auto mb-4 rounded-pill" style={{ width: "80px", height: "6px" }} />
          <p className="text-secondary fs-5">القيادة والرؤية لمستقبل اقتصادي واعد</p>
        </div>
        <Row className="g-4 justify-content-center">
          {members.map((member) => (
            <Col xs={6} md={4} lg={3} key={member.id}>
              <Card className="h-100 text-center border-0 shadow-sm rounded-4 transition-all hover-translate-y bg-white p-4">
                <div className="rounded-circle border border-4 border-light shadow-sm mx-auto mb-4 overflow-hidden position-relative" style={{ width: "130px", height: "130px", backgroundColor: "#f8fbfb" }}>
                  {member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="w-100 h-100 object-fit-cover" /> : <span className="material-symbols-outlined text-muted position-absolute top-50 start-50 translate-middle" style={{ fontSize: "4rem" }}>person</span>}
                </div>
                <h3 className="h6 fw-bolder text-dark mb-2">{member.name}</h3>
                <Badge bg="transparent" className="text-gold border border-gold px-3 py-2 rounded-pill mt-2 fw-bold">{member.roleTitle}</Badge>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
