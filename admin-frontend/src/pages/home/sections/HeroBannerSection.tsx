// src/pages/home/sections/HeroBannerSection.tsx
import { Carousel, Container, Row, Col } from "react-bootstrap";
import type { Banner } from "../../../types/public";

interface HeroBannerSectionProps {
  banners: Banner[];
}

export default function HeroBannerSection({ banners }: HeroBannerSectionProps) {
  return (
    <section className="position-relative bg-primary overflow-hidden">
      {banners.length > 0 ? (
        // تم إخفاء الـ indicators الافتراضية، وسنخصص الأسهم (controls) عبر الـ CSS
        <Carousel fade controls={banners.length > 1} indicators={false} interval={6000} className="custom-hero-carousel">
          {banners.map((banner) => (
            <Carousel.Item key={banner.id} style={{ height: "75vh", minHeight: "550px", maxHeight: "800px" }}>
              
              {/* === الخلفية والطبقة الشفافة (Overlay) === */}
              <div className="position-absolute top-0 start-0 w-100 h-100 z-0 overflow-hidden bg-dark">
                {/* تم إضافة كلاس hero-zoom-bg لعمل تأثير التقريب البطيء */}
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-100 h-100 object-fit-cover hero-zoom-bg" 
                  style={{ filter: "brightness(0.9)" }} 
                />
                {/* تدرج لوني أغمق من جهة اليمين (لأن النص عربي RTL) لضمان وضوح النص */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100" 
                  style={{ background: "linear-gradient(to left, rgba(10, 77, 68, 0.95) 0%, rgba(10, 77, 68, 0.4) 60%, rgba(0,0,0,0.1) 100%)" }} 
                />
              </div>

              {/* === المحتوى (اللوحة الزجاجية) === */}
              <Container className="h-100 position-relative z-1 d-flex align-items-center">
                <Row className="w-100">
                  <Col xl={7} lg={8} md={10} sm={12}>
                    <div className="glass-panel p-4 p-md-5 rounded-4 shadow-lg border border-white border-opacity-25 transition-all hover-shadow-xl">
                      
                      <span className="d-inline-flex align-items-center gap-2 bg-gold text-primary px-3 py-1 rounded-pill small fw-bold mb-4 shadow-sm">
                        <span className="bg-primary rounded-circle animate-pulse" style={{ width: "8px", height: "8px" }} /> 
                        إعلان الغرفة
                      </span>
                      
                      <h2 className="display-5 fw-bold mb-4 lh-base text-white text-shadow-sm">
                        {banner.title}
                      </h2>
                      
                      {banner.link && (
                        <div className="mt-4">
                          <a 
                            href={banner.link} 
                            target={banner.link.startsWith("http") ? "_blank" : "_self"} 
                            rel="noopener noreferrer" 
                            className="btn bg-gold text-primary fw-bolder px-4 py-3 rounded-3 shadow-lg hover-translate-y d-inline-flex align-items-center gap-2 group transition-all"
                          >
                            التفاصيل الكاملة 
                            <span className="material-symbols-outlined fs-5 group-hover-translate-x transition-transform">arrow_back</span>
                          </a>
                        </div>
                      )}

                    </div>
                  </Col>
                </Row>
              </Container>

            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        // حالة عدم وجود بانرات
        <div style={{ height: "60vh", minHeight: "400px" }} className="w-100 d-flex align-items-center justify-content-center text-white text-center bg-primary">
          <div className="glass-panel p-5 rounded-4 border border-white border-opacity-10">
            <span className="material-symbols-outlined display-1 text-gold mb-3">account_balance</span>
            <h2 className="display-4 fw-bold">غرفة تجارة حماة</h2>
          </div>
        </div>
      )}
    </section>
  );
}