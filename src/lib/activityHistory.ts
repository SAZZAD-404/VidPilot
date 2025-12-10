// Unified Activity History Manager

export type ActivityType = 'caption' | 'social_post' | 'video' | 'export' | 'schedule';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  content: string;
  metadata: {
    platform?: string;
    tone?: string;
    language?: string;
    hashtags?: string[];
    variations?: number;
    format?: string;
  };
  created_at: string;
}

const STORAGE_KEY = 'vidpilot_activity_history';

export const activityHistory = {
  // Get all activities
  getAll(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading activity history:', error);
      return [];
    }
  },

  // Add a new activity
  add(activity: Omit<Activity, 'id' | 'created_at'>): Activity {
    const activities = this.getAll();
    const newActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    
    // Keep only last 500 activities
    const trimmed = activities.slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('activityHistoryUpdated', { 
        detail: { activity: newActivity, total: trimmed.length } 
      }));
    }
    
    return newActivity;
  },

  // Add caption generation activity
  addCaptionGeneration(captions: any[], options: any): Activity {
    return this.add({
      type: 'caption',
      title: `Generated ${captions.length} Captions`,
      content: captions[0]?.text || '',
      metadata: {
        platform: options.platform,
        tone: options.tone,
        language: options.language,
        hashtags: captions[0]?.hashtags || [],
      },
    });
  },

  // Add social post generation activity
  addSocialPostGeneration(posts: any[], options: any): Activity {
    return this.add({
      type: 'social_post',
      title: `Generated ${posts.length} Social Posts`,
      content: posts[0]?.text || '',
      metadata: {
        platform: options.platform,
        tone: options.tone,
        variations: posts.length,
        hashtags: posts[0]?.hashtags || [],
      },
    });
  },

  // Add export activity
  addExport(format: string, count: number): Activity {
    return this.add({
      type: 'export',
      title: `Exported ${count} items as ${format.toUpperCase()}`,
      content: `Successfully exported ${count} captions/posts`,
      metadata: {
        format,
      },
    });
  },

  // Delete an activity
  delete(id: string): void {
    const activities = this.getAll().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  },

  // Clear all
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get by type
  getByType(type: ActivityType): Activity[] {
    return this.getAll().filter(a => a.type === type);
  },

  // Get recent (last N)
  getRecent(count: number = 10): Activity[] {
    return this.getAll().slice(0, count);
  },

  // Search
  search(query: string): Activity[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.content.toLowerCase().includes(lowerQuery) ||
      a.metadata.platform?.toLowerCase().includes(lowerQuery) ||
      a.metadata.tone?.toLowerCase().includes(lowerQuery)
    );
  },

  // Get stats
  getStats() {
    const activities = this.getAll();
    return {
      total: activities.length,
      captions: activities.filter(a => a.type === 'caption').length,
      socialPosts: activities.filter(a => a.type === 'social_post').length,
      exports: activities.filter(a => a.type === 'export').length,
      today: activities.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.created_at).toDateString() === today;
      }).length,
    };
  },
};
