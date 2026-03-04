// Shared types for public-facing pages (e.g. PublicHome sections)

export interface BoardMember {
  id: string;
  name: string;
  roleTitle: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface Law {
  id: string;
  title: string;
  content: string;
  fileUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Circular {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
}
