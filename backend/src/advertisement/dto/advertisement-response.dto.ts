export class AdvertisementResponseDto {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  contactInfo?: string;
  isActive: boolean;
  isPremium: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  
  author: {
    id: string;
    email: string;
  };
  
  category?: {
    id: string;
    name: string;
  };
  
  images: Array<{
    id: string;
    url?: string;
    data?: string;
    type?: string;
    alt?: string;
    isPrimary: boolean;
    order: number;
  }>;
}
