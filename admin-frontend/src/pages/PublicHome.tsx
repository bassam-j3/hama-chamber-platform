import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner, Button, Container } from "react-bootstrap";
import axiosInstance from "../api/axiosInstance";
import type { BoardMember, Project, Law, Circular, News, Banner, Faq } from "../types/public";
import {
  HeroBannerSection,
  AboutSection, 
  NewsSection,
  LawsCircularsSection,
  ProjectsSection,
  BoardMembersSection,
  FaqSection,
  ContactSection,
} from "./home/sections";
import NewsModal from "./home/NewsModal";
import ProjectModal from "./home/ProjectModal";

export default function PublicHome() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, projectsRes, lawsRes, circularsRes, newsRes, bannersRes, faqsRes] = await Promise.all([
          axiosInstance.get("/board-members").catch(() => ({ data: [] })),
          axiosInstance.get("/projects").catch(() => ({ data: [] })),
          axiosInstance.get("/laws").catch(() => ({ data: [] })),
          axiosInstance.get("/circulars").catch(() => ({ data: [] })),
          axiosInstance.get("/news").catch(() => ({ data: [] })),
          axiosInstance.get("/banners").catch(() => ({ data: [] })),
          axiosInstance.get("/faqs").catch(() => ({ data: [] })),
        ]);

        setMembers(membersRes.data.filter((m: BoardMember) => m.isActive));
        setProjects(projectsRes.data.filter((p: Project) => p.isActive));
        setLaws(lawsRes.data.filter((l: Law) => l.isActive));
        setCirculars(circularsRes.data.filter((c: Circular) => c.isActive));
        setNews(newsRes.data.filter((n: News) => n.isActive));
        setBanners(bannersRes.data.filter((b: Banner) => b.isActive));
        setFaqs(faqsRes.data.filter((f: Faq) => f.isActive));
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

  return (
    <div dir="rtl">
      <HeroBannerSection banners={banners} />
      
      <div id="about"><AboutSection /></div>
      
      {news.length > 0 && (
        <div id="news-section">
          <NewsSection news={news} onSelectNews={setSelectedNews} />
          <div className="text-center bg-white pb-5">
            <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all" onClick={() => navigate('/news')}>
              عرض كافة الأخبار <span className="material-symbols-outlined fs-5">arrow_back</span>
            </Button>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div id="projects">
          <ProjectsSection projects={projects} onSelectProject={setSelectedProject} />
          <div className="text-center bg-light pb-5 pt-3">
            <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all" onClick={() => navigate('/projects')}>
              عرض كافة المشاريع <span className="material-symbols-outlined fs-5">arrow_back</span>
            </Button>
          </div>
        </div>
      )}

      {/* 🟢 قسم القوانين والتعاميم مع الأزرار 🟢 */}
      <div id="laws-section">
        <LawsCircularsSection laws={laws} circulars={circulars} />
        <div className="text-center bg-white pb-5 d-flex justify-content-center flex-wrap gap-3">
           <Button variant="outline-primary" className="rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all" onClick={() => navigate('/laws')}>
             عرض كافة القوانين <span className="material-symbols-outlined fs-5">gavel</span>
           </Button>
           <Button variant="outline-info" className="rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all text-dark" onClick={() => navigate('/circulars')}>
             عرض كافة التعاميم <span className="material-symbols-outlined fs-5">assignment</span>
           </Button>
        </div>
      </div>
      
      {/* 🟢 قسم الأعضاء مع الأزرار 🟢 */}
      <div id="board-members">
        <BoardMembersSection members={members} />
        <div className="text-center bg-light pb-5">
           <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all" onClick={() => navigate('/board-members')}>
             عرض كافة الأعضاء <span className="material-symbols-outlined fs-5">groups</span>
           </Button>
        </div>
      </div>

      {/* 🟢 قسم الأسئلة مع الأزرار 🟢 */}
      <div id="faqs-section">
        <FaqSection faqs={faqs} />
        <div className="text-center bg-white pb-5">
           <Button variant="outline-primary" className="rounded-pill px-5 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale transition-all" onClick={() => navigate('/faqs')}>
             تصفح جميع الأسئلة <span className="material-symbols-outlined fs-5">help_center</span>
           </Button>
        </div>
      </div>
      
      {/* 🟢 قسم الوصول السريع للفرص والمعارض 🟢 */}
      <div className="py-5 text-center border-top border-bottom" style={{ backgroundColor: '#f0f5f4' }}>
        <Container>
          <h3 className="fw-bold text-primary mb-4">اكتشف المزيد من خدمات الغرفة</h3>
          <div className="d-flex justify-content-center flex-wrap gap-3">
             <Button variant="primary" className="rounded-pill px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm hover-scale transition-all" onClick={() => navigate('/opportunities')}>
               <span className="material-symbols-outlined fs-5">lightbulb</span> الفرص الاستثمارية والمناقصات
             </Button>
             <Button variant="primary" className="rounded-pill px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm hover-scale transition-all" onClick={() => navigate('/exhibitions')}>
               <span className="material-symbols-outlined fs-5">festival</span> المعارض والمؤتمرات
             </Button>
          </div>
        </Container>
      </div>

      <div id="contact-section"><ContactSection /></div>

      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}