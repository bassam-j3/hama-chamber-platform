// src/components/PublicLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"; 
import { Container, Navbar, Nav, Row, Col } from "react-bootstrap";
import axiosInstance from "../api/axiosInstance";
import logoImg from '../../hamachamberlogo.svg';

interface PageItem { 
  id: string; 
  title: string; 
  slug: string; 
  isActive: boolean; 
  isSecure: boolean;
}
interface MarketPrice { dollarPrice: string; gold21Price: string; }
interface NewsItem { id: string; title: string; createdAt: string; isActive: boolean; }

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [pagesList, setPagesList] = useState<PageItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice>({ dollarPrice: "0", gold21Price: "0" });
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  
  const [activeSection, setActiveSection] = useState<string>('home');
  const [expanded, setExpanded] = useState(false); 

  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        const [pagesRes, pricesRes, newsRes] = await Promise.all([
          axiosInstance.get("/pages").catch(() => ({ data: [] })),
          axiosInstance.get("/prices").catch(() => ({ data: { dollarPrice: "0", gold21Price: "0" } })),
          axiosInstance.get("/news").catch(() => ({ data: [] }))
        ]);
        
        setPagesList(pagesRes.data.filter((p: PageItem) => p.isActive && !p.isSecure));
        if (pricesRes.data) setMarketPrices(pricesRes.data);

        if (newsRes.data) {
          const activeNews = newsRes.data.filter((n: NewsItem) => n.isActive);
          const sortedNews = activeNews.sort((a: NewsItem, b: NewsItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
          const recentNews = sortedNews.filter((n: NewsItem) => new Date(n.createdAt).getTime() > twentyFourHoursAgo);
          
          setLatestNews(recentNews.length > 0 ? recentNews : sortedNews.slice(0, 3));
        }

      } catch (error) { console.error(error); }
    };
    fetchLayoutData();
  }, []);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // ==========================================
  // 👇 تم استعادة الـ Scroll Spy لكل الأقسام 👇
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      // أضفنا كل المعرفات (IDs) الموجودة في الصفحة الرئيسية ليتعرف عليها الـ ScrollSpy
      const sections = ['about', 'news-section', 'opportunities', 'exhibitions', 'projects', 'laws-section', 'board-members', 'faqs-section', 'contact-section']; 
      let current = 'home';

      if (window.scrollY < 150) {
        setActiveSection('home');
        return;
      }

      const scrollPosition = window.scrollY + 250; 

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            current = sectionId;
          }
        }
      }

      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        current = 'contact-section';
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleHashClick = (e: React.MouseEvent<HTMLElement>, hash: string) => {
    e.preventDefault();
    setExpanded(false); 
    
    if (location.pathname !== '/') {
      // يوجهك للرئيسية وينزل للقسم فوراً وليس لأعلى الصفحة
      navigate(`/${hash}`);
    } else {
      const elementId = hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100; 
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column ">
      
      {/* ================= Ticker Bar ================= */}
      <div className="ticker-wrap shadow-sm">
        <div className="ticker-move py-2">
          
          <div className="ticker-item align-middle">
            <div className="d-inline-flex align-items-center gap-3">
              <span className="bg-gold text-primary px-2 py-1 rounded small fw-bolder shadow-sm" style={{ fontSize: '0.7rem' }}>مباشر</span>
              
              <div className="d-inline-flex align-items-center gap-1">
                <span className="material-symbols-outlined text-gold fs-6">payments</span>
                <span className="small fw-medium">سعر صرف الدولار: <span dir="ltr" className="fw-bold text-gold">{marketPrices.dollarPrice}</span> ل.س</span>
              </div>
              
              <span className="text-white-50">|</span>
              
              <div className="d-inline-flex align-items-center gap-1">
                <span className="material-symbols-outlined text-gold fs-6">rebase_edit</span>
                <span className="small fw-medium">غرام الذهب عيار 21: <span dir="ltr" className="fw-bold text-gold">{marketPrices.gold21Price}</span> ل.س</span>
              </div>
            </div>
          </div>

          {latestNews.map((news) => (
            <div key={news.id} className="ticker-item align-middle border-end border-white border-opacity-25 pe-4 me-4">
              <div className="d-inline-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-gold fs-5">campaign</span>
                <span className="small fw-bold">{news.title}</span>
              </div>
            </div>
          ))}

          <div className="ticker-item align-middle border-end border-white border-opacity-25 pe-4 me-4">
            <div className="d-inline-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-gold fs-6">calendar_month</span>
              <span className="small fw-medium text-white-50">{new Date().toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= Header / Navbar ================= */}
      <header className="bg-white sticky-top border-bottom shadow-sm z-3 bg-opacity-75" style={{ backdropFilter: 'blur(12px)' }}>
        <Container fluid="xl" className="px-4">
          <Navbar 
            expanded={expanded} 
            onToggle={(isOpen) => setExpanded(isOpen)} 
            expand="xl" 
            className="py-3 p-0" 
            style={{ minHeight: '80px' }}
          >
            
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3 m-0" onClick={() => setExpanded(false)}>
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center shadow-inner overflow-hidden" style={{ width: '48px', height: '48px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                <img 
                  src={logoImg} 
                  alt="شعار غرفة تجارة حماة" 
                  style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
                />
              </div>
              <div>
                <h1 className="h5 fw-bold text-primary mb-0 lh-1">غرفة تجارة حماة</h1>
                <p className="text-secondary text-uppercase mt-1 mb-0 fw-medium" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Hama Chamber of Commerce</p>
              </div>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none">
               <span className="material-symbols-outlined text-primary fs-1">menu</span>
            </Navbar.Toggle>
            
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto gap-2 gap-xxl-3 fw-bold align-items-xl-center mt-3 mt-xl-0" style={{ fontSize: '0.90rem' }}>
                <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)} className={`nav-link-interactive ${activeSection === 'home' && location.pathname === '/' ? 'active-section' : ''}`}>الرئيسية</Nav.Link>
                
                {/* 👇 تم إعادة جميع الروابط للاعتماد على الهاش والـ activeSection 👇 */}
                <Nav.Link href="/#about" onClick={(e) => handleHashClick(e, '#about')} className={`nav-link-interactive ${activeSection === 'about' ? 'active-section' : ''}`}>عن الغرفة</Nav.Link>
                <Nav.Link href="/#news-section" onClick={(e) => handleHashClick(e, '#news-section')} className={`nav-link-interactive ${activeSection === 'news-section' ? 'active-section' : ''}`}>المركز الإعلامي</Nav.Link>
                <Nav.Link href="/#projects" onClick={(e) => handleHashClick(e, '#projects')} className={`nav-link-interactive ${activeSection === 'projects' ? 'active-section' : ''}`}>المشاريع</Nav.Link>
                <Nav.Link href="/#opportunities" onClick={(e) => handleHashClick(e, '#opportunities')} className={`nav-link-interactive ${activeSection === 'opportunities' ? 'active-section' : ''}`}>الفرص</Nav.Link>
                <Nav.Link href="/#exhibitions" onClick={(e) => handleHashClick(e, '#exhibitions')} className={`nav-link-interactive ${activeSection === 'exhibitions' ? 'active-section' : ''}`}>المعارض</Nav.Link>
                <Nav.Link href="/#laws-section" onClick={(e) => handleHashClick(e, '#laws-section')} className={`nav-link-interactive ${activeSection === 'laws-section' ? 'active-section' : ''}`}>القرارات</Nav.Link>
                <Nav.Link href="/#board-members" onClick={(e) => handleHashClick(e, '#board-members')} className={`nav-link-interactive ${activeSection === 'board-members' ? 'active-section' : ''}`}>أعضاء المجلس</Nav.Link>
                <Nav.Link href="/#faqs-section" onClick={(e) => handleHashClick(e, '#faqs-section')} className={`nav-link-interactive ${activeSection === 'faqs-section' ? 'active-section' : ''}`}>الأسئلة</Nav.Link>

                {pagesList.map((page) => (
                  <Nav.Link as={Link} to={`/page/${page.slug}`} key={page.id} onClick={() => setExpanded(false)} className={`nav-link-interactive ${location.pathname === `/page/${page.slug}` ? 'active-section' : ''}`}>
                    {page.title}
                  </Nav.Link>
                ))}

                <Nav.Link as={Link} to="/jobs" onClick={() => setExpanded(false)} className={`nav-link-interactive ${location.pathname === '/jobs' ? 'active-section' : ''}`}>فرص العمل</Nav.Link>

                <Nav.Link href="https://hamatrade.sy/" target="_blank" rel="noopener noreferrer" className="nav-link-interactive d-flex align-items-center gap-1" onClick={() => setExpanded(false)}>
                  منصة الدليل 
                </Nav.Link>
                
                <Nav.Link href="/#contact-section" onClick={(e) => handleHashClick(e, '#contact-section')} className={`nav-link-interactive ${activeSection === 'contact-section' ? 'active-section' : ''}`}>اتصل بنا</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </header>

      {/* ================= Main Content ================= */}
      <main className="flex-grow-1 d-flex flex-column bg-light">
        <Outlet />
      </main>

      {/* ================= Footer ================= */}
      <footer className="bg-custom-dark text-white pt-5 pb-4 border-top border-white border-opacity-10 mt-auto">
        <Container>
          <Row className="gy-5 mb-5">
            <Col lg={4}>
              <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center shadow-inner overflow-hidden" style={{ width: '48px', height: '48px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                <img 
                  src={logoImg} 
                  alt="شعار غرفة تجارة حماة" 
                  style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
                />
              </div>
                <h2 className="h4 fw-bold mb-0">غرفة تجارة حماة</h2>
              </div>
              <div className="d-flex gap-3 mt-4">
                <a href="#" className="bg-white bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-white text-decoration-none hover-bg-primary hover-text-gold transition-all border border-white border-opacity-10" style={{ width: '44px', height: '44px' }}>
                  <span className="material-symbols-outlined fs-5">facebook</span>
                </a>
                <a href="#" className="bg-white bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-white text-decoration-none hover-bg-primary hover-text-gold transition-all border border-white border-opacity-10" style={{ width: '44px', height: '44px' }}>
                  <span className="material-symbols-outlined fs-5">alternate_email</span>
                </a>
                <a href="#" className="bg-white bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center text-white text-decoration-none hover-bg-primary hover-text-gold transition-all border border-white border-opacity-10" style={{ width: '44px', height: '44px' }}>
                  <span className="material-symbols-outlined fs-5">play_circle</span>
                </a>
              </div>
            </Col>

            <Col lg={2} md={6}>
              <h3 className="h5 footer-heading">روابط سريعة</h3>
              <ul className="list-unstyled space-y-3 text-white-50 mt-4">
                <li className="mb-3"><Link to="/jobs" className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>فرص العمل</Link></li>
                <li className="mb-3"><a href="/#about" onClick={(e) => handleHashClick(e, '#about')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>عن الغرفة</a></li>
                <li className="mb-3"><a href="#" className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>سجل المنتسبين</a></li>
                <li className="mb-3"><a href="/#news-section" onClick={(e) => handleHashClick(e, '#news-section')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>المركز الإعلامي</a></li>
              </ul>
            </Col>

            <Col lg={3} md={6}>
              <h3 className="h5 footer-heading">التشريعات</h3>
              <ul className="list-unstyled space-y-3 text-white-50 mt-4">
                <li className="mb-3"><a href="/#laws-section" onClick={(e) => handleHashClick(e, '#laws-section')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>قانون التجارة السوري</a></li>
                <li className="mb-3"><a href="/#laws-section" onClick={(e) => handleHashClick(e, '#laws-section')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>قانون الاستثمار الجديد</a></li>
                <li className="mb-3"><a href="/#laws-section" onClick={(e) => handleHashClick(e, '#laws-section')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>أنظمة الغرف التجارية</a></li>
                <li className="mb-3"><a href="/#laws-section" onClick={(e) => handleHashClick(e, '#laws-section')} className="text-white-50 text-decoration-none hover-text-gold transition-all d-flex align-items-center gap-2"><span className="gold-dot"></span>الجريدة الرسمية</a></li>
              </ul>
            </Col>

            <Col lg={3}>
              <h3 className="h5 footer-heading">النشرة البريدية</h3>
              <p className="text-white-50 small mb-4 mt-4 lh-lg">اشترك لتصلك آخر التقارير الاقتصادية والقرارات الرسمية عبر بريدك.</p>
              <div className="d-flex flex-column gap-3">
                <input type="email" className="form-control bg-white bg-opacity-5 border border-white border-opacity-10 text-white py-3 px-4 rounded-3 shadow-none placeholder-white-50" placeholder="بريدك الإلكتروني" />
                <button className="btn bg-gold text-primary fw-bold py-3 rounded-3 shadow-lg transition-all hover-bg-white">اشترك الآن</button>
              </div>
            </Col>
          </Row>
          
          <div className="border-top border-white border-opacity-10 pt-4 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <p className="text-white-50 mb-0 small">© {new Date().getFullYear()} جميع الحقوق محفوظة لغرفة تجارة حماة. صمم باعتزاز.</p>
            <div className="d-flex gap-4 fw-bold" style={{ fontSize: '0.8rem' }}>
               <a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">سياسة الخصوصية</a>
               <a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">شروط الاستخدام</a>
               <a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">خريطة الموقع</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}