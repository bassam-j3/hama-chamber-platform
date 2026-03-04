// src/pages/PublicHome.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // <-- أضفنا هذا الاستيراد
import { Spinner } from "react-bootstrap";
import axiosInstance from "../api/axiosInstance";
import type { BoardMember, Project, Law, Circular, News, Banner, Faq } from "../types/public";
import {
  HeroBannerSection,
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
  const location = useLocation(); // <-- تهيئة لمعرفة الرابط الحالي
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

  // جلب البيانات
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

  // ==========================================
  // الكود السحري لحل مشكلة التنقل الدقيق (Scroll to Hash)
  // ==========================================
  useEffect(() => {
    // ننتظر قليلاً حتى تختفي شاشة التحميل (Spinner) وتظهر الأقسام
    if (!isLoading) {
      if (location.hash) {
        const elementId = location.hash.replace('#', '');
        const element = document.getElementById(elementId);
        
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location, isLoading]); // ربطناه بـ isLoading ليعمل بعد اكتمال جلب البيانات

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5 flex-grow-1">
        <Spinner animation="border" variant="primary" style={{ width: "4rem", height: "4rem", borderWidth: "0.25em" }} />
        <h5 className="mt-4 text-primary fw-bold">جاري تحميل منصة الغرفة...</h5>
      </div>
    );
  }

  return (
    <>
      <HeroBannerSection banners={banners} />
      
      {/* تم تغليف كل قسم بـ id ليتعرف عليه الـ Navbar */}
      <section id="news-section">
        <NewsSection news={news} onSelectNews={setSelectedNews} />
      </section>

      <section id="laws-section">
        <LawsCircularsSection laws={laws} circulars={circulars} />
      </section>

      <section id="projects">
        <ProjectsSection projects={projects} onSelectProject={setSelectedProject} />
      </section>

      <section id="board-members">
        <BoardMembersSection members={members} />
      </section>

      <section id="faqs-section">
        <FaqSection faqs={faqs} />
      </section>

      <section id="contact-section">
        <ContactSection />
      </section>

      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}