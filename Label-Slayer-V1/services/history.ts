
import { LabelAnalysis } from './openai';

export interface HistoryItem extends LabelAnalysis {
  id: string;
  timestamp: number;
  photoUri?: string;
}

const HISTORY_KEY = 'label_slayer_history';

export class HistoryService {
  static async saveAnalysis(analysis: LabelAnalysis, photoUri?: string): Promise<void> {
    try {
      const historyItem: HistoryItem = {
        ...analysis,
        id: Date.now().toString(),
        timestamp: Date.now(),
        photoUri,
      };

      const existingHistory = await this.getHistory();
      const updatedHistory = [historyItem, ...existingHistory].slice(0, 50); // Keep only last 50 items

      if (typeof Storage !== 'undefined') {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save analysis to history:', error);
    }
  }

  static async getHistory(): Promise<HistoryItem[]> {
    try {
      if (typeof Storage !== 'undefined') {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
      }
      return [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      
      if (typeof Storage !== 'undefined') {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem(HISTORY_KEY);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  static formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }

  static getProductEmoji(productName: string): string {
    const name = productName.toLowerCase();
    
    if (name.includes('water') || name.includes('drink')) return '💧';
    if (name.includes('bread') || name.includes('toast')) return '🍞';
    if (name.includes('milk') || name.includes('dairy')) return '🥛';
    if (name.includes('cheese')) return '🧀';
    if (name.includes('yogurt')) return '🥛';
    if (name.includes('chicken') || name.includes('meat')) return '🍗';
    if (name.includes('fish') || name.includes('salmon')) return '🐟';
    if (name.includes('egg')) return '🥚';
    if (name.includes('apple') || name.includes('fruit')) return '🍎';
    if (name.includes('vegetable') || name.includes('carrot')) return '🥕';
    if (name.includes('cereal') || name.includes('oats')) return '🥣';
    if (name.includes('pasta') || name.includes('noodle')) return '🍝';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('cookie') || name.includes('biscuit')) return '🍪';
    if (name.includes('chocolate') || name.includes('candy')) return '🍫';
    if (name.includes('ice cream')) return '🍦';
    if (name.includes('coffee')) return '☕';
    if (name.includes('tea')) return '🍵';
    if (name.includes('soda') || name.includes('cola')) return '🥤';
    if (name.includes('energy')) return '⚡';
    if (name.includes('protein') || name.includes('bar')) return '🍫';
    if (name.includes('snack') || name.includes('chip')) return '🥨';
    if (name.includes('soup')) return '🍲';
    if (name.includes('sauce')) return '🥫';
    
    return '📦'; // Default emoji
  }
}
