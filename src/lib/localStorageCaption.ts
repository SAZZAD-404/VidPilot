// Local Storage Caption Manager (Fallback when not logged in)

export interface LocalCaption {
  id: string;
  text: string;
  hashtags: string[];
  tone: string;
  language: string;
  platform: string;
  saved: boolean;
  created_at: string;
}

const STORAGE_KEY = 'vidpilot_captions';

export const localCaptionStorage = {
  // Get all captions
  getAll(): LocalCaption[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading captions from localStorage:', error);
      return [];
    }
  },

  // Save a caption
  save(caption: Omit<LocalCaption, 'id' | 'created_at'>): LocalCaption {
    const captions = this.getAll();
    const newCaption: LocalCaption = {
      ...caption,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    captions.unshift(newCaption);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captions));
    return newCaption;
  },

  // Save multiple captions
  saveMany(captionsData: Omit<LocalCaption, 'id' | 'created_at'>[]): LocalCaption[] {
    const captions = this.getAll();
    const newCaptions = captionsData.map(caption => ({
      ...caption,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }));
    const updated = [...newCaptions, ...captions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCaptions;
  },

  // Delete a caption
  delete(id: string): void {
    const captions = this.getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captions));
  },

  // Update a caption
  update(id: string, updates: Partial<LocalCaption>): void {
    const captions = this.getAll().map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captions));
  },

  // Clear all
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get count
  count(): number {
    return this.getAll().length;
  }
};
