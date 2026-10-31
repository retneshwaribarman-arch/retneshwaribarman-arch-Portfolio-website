export interface Photo {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  thumbnailUrl?: string;
  aspectRatio: 'landscape' | 'portrait' | 'square';
  date?: string;
  camera?: string;
  lens?: string;
  client?: string;
  featured?: boolean;
  order: number;
}

export interface AboutData {
  name: string;
  title: string;
  bio: string[];
  portraitUrl: string;
  location: string;
  yearsExperience: number;
  exhibitionsCount: number;
  awardsCount: number;
  philosophy: string;
  clients: string[];
}

export interface ContactData {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  location: string;
  bookingNotice: string;
  availability: 'Available for commissions' | 'Limited availability' | 'Booked through season';
}

export interface ClientMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PortfolioData {
  photos: Photo[];
  about: AboutData;
  contact: ContactData;
  categories: string[];
}
