// Activity Tracker Service - Connects to Python Flask Backend

export interface ActivityData {
  [category: string]: number; // category name -> minutes spent
}

export interface ActivityRecord {
  timestamp: string;
  appName: string;
  windowTitle: string;
  category: string;
}

export interface ActivitySummary {
  totalMinutes: number;
  studyMinutes: number;
  entertainmentMinutes: number;
  otherMinutes: number;
  categories: ActivityData;
}

class ActivityTrackerService {
  private baseUrl = 'http://127.0.0.1:5000';

  /**
   * Get activity data from the Python backend
   */
  async getActivityData(): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/activity-data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // Return mock data if backend is not available
      return this.getMockActivityData();
    }
  }

  /**
   * Process raw activity data into a summary
   */
  processActivityData(activityData: ActivityData): ActivitySummary {
    let studyMinutes = 0;
    let entertainmentMinutes = 0;
    let otherMinutes = 0;

    // Categorize based on common category names
    Object.entries(activityData).forEach(([category, minutes]) => {
      const categoryLower = category.toLowerCase();
      
      if (categoryLower.includes('study') || 
          categoryLower.includes('education') || 
          categoryLower.includes('learning') ||
          categoryLower.includes('academic') ||
          categoryLower.includes('research')) {
        studyMinutes += minutes;
      } else if (categoryLower.includes('entertainment') || 
                 categoryLower.includes('game') || 
                 categoryLower.includes('video') ||
                 categoryLower.includes('music') ||
                 categoryLower.includes('social')) {
        entertainmentMinutes += minutes;
      } else {
        otherMinutes += minutes;
      }
    });

    const totalMinutes = studyMinutes + entertainmentMinutes + otherMinutes;

    return {
      totalMinutes,
      studyMinutes,
      entertainmentMinutes,
      otherMinutes,
      categories: activityData
    };
  }

  /**
   * Get activity summary with processed data
   */
  async getActivitySummary(): Promise<ActivitySummary> {
    const activityData = await this.getActivityData();
    return this.processActivityData(activityData);
  }

  /**
   * Check if the Python backend is running
   */
  async checkBackendStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/activity-data`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Mock data for when backend is not available
   */
  private getMockActivityData(): ActivityData {
    return {
      'Study': 45.5,
      'Entertainment': 23.2,
      'Productivity': 15.8,
      'Social Media': 12.3,
      'Other': 8.7
    };
  }

  /**
   * Get productivity percentage (study time / total time)
   */
  getProductivityPercentage(summary: ActivitySummary): number {
    if (summary.totalMinutes === 0) return 0;
    return Math.round((summary.studyMinutes / summary.totalMinutes) * 100);
  }

  /**
   * Get entertainment percentage
   */
  getEntertainmentPercentage(summary: ActivitySummary): number {
    if (summary.totalMinutes === 0) return 0;
    return Math.round((summary.entertainmentMinutes / summary.totalMinutes) * 100);
  }

  /**
   * Format minutes to hours and minutes
   */
  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Get activity status based on study time
   */
  getActivityStatus(summary: ActivitySummary): {
    status: 'excellent' | 'good' | 'average' | 'needs-improvement';
    message: string;
    color: string;
  } {
    const productivityPercentage = this.getProductivityPercentage(summary);
    
    if (productivityPercentage >= 70) {
      return {
        status: 'excellent',
        message: 'Excellent focus on studies!',
        color: 'text-green-600'
      };
    } else if (productivityPercentage >= 50) {
      return {
        status: 'good',
        message: 'Good balance of study time',
        color: 'text-blue-600'
      };
    } else if (productivityPercentage >= 30) {
      return {
        status: 'average',
        message: 'Room for improvement',
        color: 'text-yellow-600'
      };
    } else {
      return {
        status: 'needs-improvement',
        message: 'Focus more on studies',
        color: 'text-red-600'
      };
    }
  }
}

// Export singleton instance
export const activityTracker = new ActivityTrackerService();
