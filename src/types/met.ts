export interface MetSearchResponse {
  total: number;
  objectIDs: number[];
}

export interface MetObject {
  objectID: number;
  isHighlight: boolean;
  accessionNumber: string;
  accessionYear: string;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  additionalImages: string[];
  constituents: Constituent[] | null;
  department: string;
  objectName: string;
  title: string;
  culture: string;
  period: string;
  dynasty: string;
  reign: string;
  portfolio: string;
  artistRole: string;
  artistPrefix: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  artistSuffix: string;
  artistAlphaSort: string;
  artistNationality: string;
  artistBeginDate: string;
  artistEndDate: string;
  artistGender: string;
  artistWikidata_URL: string;
  artistULAN_URL: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  medium: string;
  dimensions: string;
  measurements: Measurement[] | null;
  creditLine: string;
  geographyType: string;
  city: string;
  state: string;
  county: string;
  country: string;
  region: string;
  subregion: string;
  locale: string;
  locus: string;
  excavation: string;
  river: string;
  classification: string;
  rightsAndReproduction: string;
  linkResource: string;
  metadataDate: string;
  repository: string;
  objectURL: string;
  tags: Tag[] | null;
  objectWikidata_URL: string;
  isTimelineWork: boolean;
  GalleryNumber: string;
}

export interface Constituent {
  constituentID: number;
  role: string;
  name: string;
  constituentULAN_URL: string;
  constituentWikidata_URL: string;
  gender: string;
}

export interface Measurement {
  elementName: string;
  elementDescription: string | null;
  elementMeasurements: {
    Height: number;
    Width: number;
  };
}

export interface Tag {
  term: string;
  AAT_URL: string;
  Wikidata_URL: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  artwork?: MetObject;
}

export type Mood = 'happy' | 'sad' | 'energized' | 'peaceful' | 'inspired' | 'mysterious';