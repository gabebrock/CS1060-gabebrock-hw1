import { MetSearchResponse, MetObject, Mood } from '@/types/met';

const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Only allow departments with paintings, photos, and drawings
const ALLOWED_DEPARTMENTS = [
  'European Paintings',
  'American Paintings and Sculpture',
  'Modern and Contemporary Art',
  'Photographs',
  'Drawings and Prints',
  'Asian Art',
  'Islamic Art'
];

// Mood to search term mappings
const MOOD_MAPPINGS: Record<Mood, { terms: string[], departments?: string[] }> = {
  happy: {
    terms: ['flowers', 'garden', 'celebration', 'children', 'bright', 'colorful'],
    departments: ['European Paintings', 'Photographs', 'Drawings and Prints']
  },
  sad: {
    terms: ['melancholy', 'solitude', 'rain', 'winter', 'portrait'],
    departments: ['European Paintings', 'Drawings and Prints']
  },
  energized: {
    terms: ['action', 'movement', 'sport', 'dance', 'dynamic'],
    departments: ['Modern and Contemporary Art', 'Photographs']
  },
  peaceful: {
    terms: ['landscape', 'nature', 'calm', 'meditation', 'quiet'],
    departments: ['Asian Art', 'European Paintings', 'Drawings and Prints']
  },
  inspired: {
    terms: ['masterpiece', 'innovative', 'creative', 'artistic'],
    departments: ['Modern and Contemporary Art', 'European Paintings']
  },
  mysterious: {
    terms: ['dark', 'shadow', 'mysterious', 'unknown', 'surreal'],
    departments: ['Modern and Contemporary Art', 'Drawings and Prints']
  }
};

export class MetAPI {
  static async searchObjects(query: string): Promise<number[]> {
    try {
      const response = await fetch(`${MET_API_BASE}/search?hasImages=true&q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data: MetSearchResponse = await response.json();
      return data.objectIDs || [];
    } catch (error) {
      console.error('MET API search error:', error);
      return [];
    }
  }

  static async getObject(objectId: number): Promise<MetObject | null> {
    try {
      const response = await fetch(`${MET_API_BASE}/objects/${objectId}`);
      if (!response.ok) throw new Error('Object fetch failed');
      
      const data: MetObject = await response.json();
      return data;
    } catch (error) {
      console.error('MET API object error:', error);
      return null;
    }
  }

  static async getObjectsByMood(mood: Mood, limit: number = 5): Promise<MetObject[]> {
    const mapping = MOOD_MAPPINGS[mood];
    const results: MetObject[] = [];
    
    // Try different search terms
    for (const term of mapping.terms) {
      if (results.length >= limit) break;
      
      const objectIds = await this.searchObjects(term);
      
      // Randomly sample from results to avoid always getting the same objects
      const shuffled = objectIds.sort(() => 0.5 - Math.random());
      const sampled = shuffled.slice(0, 10);
      
      for (const id of sampled) {
        if (results.length >= limit) break;
        
        const obj = await this.getObject(id);
        if (this.isValidArtwork(obj)) {
          results.push(obj);
        }
      }
    }
    
    return results;
  }

  private static isValidArtwork(obj: MetObject | null): boolean {
    if (!obj) return false;
    
    // Must have image
    if (!obj.primaryImage) return false;
    
    // Must be public domain
    if (!obj.isPublicDomain) return false;
    
    // Only allow paintings, photos, and drawings departments
    if (!ALLOWED_DEPARTMENTS.some(dept => obj.department.includes(dept))) return false;
    
    // Exclude sculptures, statues, and 3D objects
    const excludeTerms = ['sculpture', 'statue', 'bust', 'relief', 'marble', 'bronze', 'ceramic', 'vessel', 'vase', 'bowl', 'cup', 'jar'];
    const combinedText = `${obj.title} ${obj.objectName} ${obj.medium}`.toLowerCase();
    if (excludeTerms.some(term => combinedText.includes(term))) return false;
    
    // Only allow 2D artworks - paintings, drawings, prints, photographs
    const allowedTypes = ['painting', 'drawing', 'print', 'photograph', 'sketch', 'watercolor', 'oil', 'canvas', 'paper', 'etching', 'lithograph'];
    if (!allowedTypes.some(type => combinedText.includes(type))) return false;
    
    return true;
  }

  static extractMoodFromMessage(message: string): Mood | null {
    const text = message.toLowerCase();
    
    if (text.includes('happy') || text.includes('joy') || text.includes('cheer')) return 'happy';
    if (text.includes('sad') || text.includes('melancholy') || text.includes('down')) return 'sad';
    if (text.includes('energy') || text.includes('energized') || text.includes('excited')) return 'energized';
    if (text.includes('peaceful') || text.includes('calm') || text.includes('relaxed')) return 'peaceful';
    if (text.includes('inspired') || text.includes('creative') || text.includes('motivated')) return 'inspired';
    if (text.includes('mysterious') || text.includes('dark') || text.includes('unknown')) return 'mysterious';
    
    return null;
  }
}