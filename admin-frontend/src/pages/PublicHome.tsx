import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner, Container, Row, Col, Card, Button } from "react-bootstrap";
import axiosInstance from "../api/axiosInstance";
import type { Project, News, Banner } from "../types/public";
import {
  HeroBannerSection,
  AboutSection, 
  NewsSection,
  ProjectsSection,
  ContactSection,
} from "./home/sections";
import NewsModal from "./home/NewsModal";
import ProjectModal from "./home/ProjectModal";

export default function PublicHome() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      try {
        // تحسين الأداء (Performance): جلب البيانات الضرورية فقط للصفحة الرئيسية
        const [projectsRes, newsRes, bannersRes] = await Promise.all([
          axiosInstance.get("/projects").catch(() => ({ data: [] })),
          axiosInstance.get("/news").catch(() => ({ data: [] })),
          axiosInstance.get("/banners").catch(() => ({ data: [] })),
        ]);

        // نأخذ أحدث 3 مشاريع وأحدث 4 أخبار فقط لغرض المعاينة
        setProjects(projectsRes.data.filter((p: Project) => p.isActive).slice(0, 3));
        setNews(newsRes.data.filter((n: News) => n.isActive).slice(0, 4));
        setBanners(bannersRes.data.filter((b: Banner) => b.isActive));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (location.hash) {
        const elementId = location.hash.replace('#', '');
        const element = document.getElementById(elementId);
        if (element) {
          setTimeout(() => {
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 150);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location, isLoading]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5 flex-grow-1" dir="rtl">
        <Spinner animation="border" variant="primary" style={{ width: "4rem", height: "4rem", borderWidth: "0.25em" }} />
        <h5 className="mt-4 text-primary fw-bold">جاري تحميل منصة الغرفة...</h5>
      </div>
    );
  }

  // روابط الأقسام السريعة (Portal)
  const portalSections = [
    { title: "الأخبار والنشاطات", icon: "newspaper", link: "/news", desc: "آخر أخبار وفعاليات غرفة تجارة حماة" },
    { title: "المشاريع", icon: "business_center", link: "/projects", desc: "المشاريع التنموية والاقتصادية" },
    { title: "القوانين والتشريعات", icon: "gavel", link: "/laws", desc: "أحدث القوانين والمراسيم التجارية" },
    { title: "التعاميم والقرارات", icon: "assignment", link: "/circulars", desc: "قرارات وتعاميم الغرفة والوزارة" },
    { title: "الفرص الاستثمارية", icon: "lightbulb", link: "/opportunities", desc: "فرص ومناقصات متاحة للاستثمار" },
    { title: "المعارض والمؤتمرات", icon: "storefront", link: "/exhibitions", desc: "مشاركات الغرفة في الفعاليات" },
    { title: "أعضاء مجلس الإدارة", icon: "groups", link: "/board-members", desc: "تعرف على أعضاء مجلس الإدارة" },
    { title: "الأسئلة الشائعة", icon: "help_center", link: "/faqs", desc: "إجابات لاستفسارات التجار والمواطنين" },
  ];

  return (
    <div dir="rtl">
      <HeroBannerSection banners={banners} />
      
      {/* قسم بوابة التنقل (Portal Grid) */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-primary mb-3">أقسام ومرافق الغرفة</h2>
            <p className="text-muted fs-5">تصفح الخدمات، المعلومات، وأحدث الإصدارات المتاحة للتجار والمستثمرين</p>
          </div>
          <Row className="g-4">
            {portalSections.map((section, idx) => (
              <Col key={idx} xs={12} sm={6} lg={3}>
                <Card 
                  className="h-100 shadow-sm border-0 text-center portal-card h-100"
                  onClick={() => navigate(section.link)}
                  style={{ borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 1rem 3rem rgba(0,0,0,.175)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                  }}
                >
                  <Card.Body className="p-4 d-flex flex-column align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center mb-3 transition-all" style={{ width: '70px', height: '70px' }}>
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '35px' }}>{section.icon}</span>
                    </div>
                    <h5 className="fw-bold text-dark">{section.title}</h5>
                    <p className="text-muted small mb-0 mt-2">{section.desc}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <div id="about"><AboutSection /></div>
      
      {/* معاينة الأخبار (News Preview) */}
      {news.length > 0 && (
        <div id="news-section">
          <NewsSection news={news} onSelectNews={setSelectedNews} />
          <div className="text-center bg-white pb-5">
            <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold" onClick={() => navigate('/news')}>
              عرض كافة الأخبار <span className="material-symbols-outlined align-middle fs-6">arrow_left</span>
            </Button>
          </div>
        </div>
      )}

      {/* معاينة المشاريع (Projects Preview) */}
      {projects.length > 0 && (
        <div id="projects">
          <ProjectsSection projects={projects} onSelectProject={setSelectedProject} />
          <div className="text-center bg-light pb-5 pt-3">
            <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold" onClick={() => navigate('/projects')}>
              عرض كافة المشاريع <span className="material-symbols-outlined align-middle fs-6">arrow_left</span>
            </Button>
          </div>
        </div>
      )}

      <div id="contact-section"><ContactSection /></div>

      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}