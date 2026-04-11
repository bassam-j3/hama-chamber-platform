import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SectionPageTemplate from '../components/SectionPageTemplate';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from './home/ProjectModal';
import type { Project } from '../types/public';

export default function PublicProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/projects');
      setProjects(response.data.filter((p: Project) => p.isActive));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('تعذر تحميل المشاريع. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  return (
    <>
      <SectionPageTemplate
        title="مشاريع الغرفة التنموية"
        description="تعرف على أهم المشاريع والأنشطة الاقتصادية والتنموية التي تديرها الغرفة"
        icon="account_tree"
        items={projects}
        isLoading={loading}
        error={error}
        onRetry={fetchProjects}
        emptyMessage="لا توجد مشاريع منشورة حالياً."
        renderCard={(item: Project) => (
          <ProjectCard item={item} onClick={setSelectedProject} />
        )}
      />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
