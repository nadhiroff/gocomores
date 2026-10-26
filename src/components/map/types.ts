export interface MapPlace {
  id: number;
  slug: string;
  name: string;
  summary: string;
  lat: number;
  lng: number;
  verified: boolean;
  island: { slug: string; name: string; localName: string; color: string };
  category: { slug: string; name: string };
}
