export interface PersonalProfile {
  name: string;
  title: string;
  tagline: string;
  statement: {
    lead: string;
    focus: string;
  };
  paragraphs: string[];
  quote: string;
  location: string;
  coordinates: string;
  city: string;
  timeZone: string;
  email: string;
  github: string;
  githubHandle: string;
  linkedin: string;
  photo: string;
  facts: { key: string; label: string; value: string }[];
  capabilities: string[];
  stack: string[];
}

export interface ProjectRoom {
  id: string;
  roomNumber: string;
  category: string;
  title: string;
  period: string;
  status: string;
  signal: string;
  description: string;
  tech: string[];
  links: {
    label: string;
    url: string;
    type?: "code" | "live" | "docs" | "npm";
  }[];
  previewImage?: string;
}

export interface ExperienceRole {
  id: string;
  index: string;
  title: string;
  company: string;
  companyType: string;
  location: string;
  focus: string;
  period: string;
  isCurrent?: boolean;
  points: string[];
  tech: string[];
}

export interface ArticleTransmission {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  lang: "id" | "en";
  link: string;
}

export interface PortfolioConfig {
  personal: PersonalProfile;
  projects: ProjectRoom[];
  experiences: ExperienceRole[];
  transmissions: ArticleTransmission[];
}
