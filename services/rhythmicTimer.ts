/**
 * Rhythmic Timer service for time-based and song-based habit completion
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimerMode } from '@/models/types';

export interface TimerState {
  habitId: string;
  mode: TimerMode;
  targetDuration: number; // minutes for time mode, song count for song mode
  elapsedTime: number; // milliseconds
  songsPlayed: number;
  currentSongTitle?: string;
  isRunning: boolean;
  startedAt?: string;
}

const TIMER_STATE_KEY = 'dv_timer_state';

/**
 * Rhythmic Timer Service
 */
class RhythmicTimerService {
  private state: TimerState | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onUpdate?: (state: TimerState) => void;
  private onComplete?: () => void;

  /**
   * Load timer state from storage
   */
  async loadState(): Promise<TimerState | null> {
    try {
      const data = await AsyncStorage.getItem(TIMER_STATE_KEY);
      if (data) {
        this.state = JSON.parse(data);
        return this.state;
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
    return null;
  }

  /**
   * Save timer state to storage
   */
  private async saveState(): Promise<void> {
    try {
      if (this.state) {
        await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(this.state));
      } else {
        await AsyncStorage.removeItem(TIMER_STATE_KEY);
      }
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }

  /**
   * Initialize a new timer
   */
  async initTimer(
    habitId: string,
    mode: TimerMode,
    targetDuration: number,
    onUpdate: (state: TimerState) => void,
    onComplete: () => void
  ): Promise<void> {
    this.stopTimer();

    this.state = {
      habitId,
      mode,
      targetDuration,
      elapsedTime: 0,
      songsPlayed: 0,
      isRunning: false,
    };

    this.onUpdate = onUpdate;
    this.onComplete = onComplete;

    await this.saveState();
    this.onUpdate(this.state);
  }

  /**
   * Start the timer
   */
  async startTimer(): Promise<void> {
    if (!this.state || this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.startedAt = new Date().toISOString();
    await this.saveState();

    if (this.state.mode === 'time') {
      this.startTimeMode();
    } else {
      // Song mode - would integrate with music provider
      // For now, simulate with time-based fallback
      this.startSongFallbackMode();
    }

    this.onUpdate?.(this.state);
  }

  /**
   * Pause the timer
   */
  async pauseTimer(): Promise<void> {
    if (!this.state || !this.state.isRunning) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.isRunning = false;
    await this.saveState();
    this.onUpdate?.(this.state);
  }

  /**
   * Stop and reset the timer
   */
  async stopTimer(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state = null;
    this.onUpdate = undefined;
    this.onComplete = undefined;
    await this.saveState();
  }

  /**
   * Get current timer state
   */
  getState(): TimerState | null {
    return this.state;
  }

  /**
   * Check if timer is complete
   */
  isComplete(): boolean {
    if (!this.state) return false;

    if (this.state.mode === 'time') {
      const targetMs = this.state.targetDuration * 60 * 1000;
      return this.state.elapsedTime >= targetMs;
    } else {
      return this.state.songsPlayed >= this.state.targetDuration;
    }
  }

  /**
   * Get remaining time in milliseconds (for time mode)
   */
  getRemainingTime(): number {
    if (!this.state || this.state.mode !== 'time') return 0;
    const targetMs = this.state.targetDuration * 60 * 1000;
    return Math.max(0, targetMs - this.state.elapsedTime);
  }

  /**
   * Get remaining songs (for song mode)
   */
  getRemainingSongs(): number {
    if (!this.state || this.state.mode !== 'song') return 0;
    return Math.max(0, this.state.targetDuration - this.state.songsPlayed);
  }

  /**
   * Format time as MM:SS
   */
  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Start time-based mode
   */
  private startTimeMode(): void {
    const startTime = Date.now() - (this.state?.elapsedTime || 0);
    
    this.intervalId = setInterval(async () => {
      if (!this.state) return;

      this.state.elapsedTime = Date.now() - startTime;
      this.onUpdate?.(this.state);

      if (this.isComplete()) {
        await this.handleComplete();
      }
    }, 100);
  }

  /**
   * Start song fallback mode (simulates 3-minute songs)
   */
  private startSongFallbackMode(): void {
    const SIMULATED_SONG_LENGTH = 3 * 60 * 1000; // 3 minutes per song
    const startTime = Date.now() - (this.state?.elapsedTime || 0);
    
    this.intervalId = setInterval(async () => {
      if (!this.state) return;

      this.state.elapsedTime = Date.now() - startTime;
      const newSongsPlayed = Math.floor(this.state.elapsedTime / SIMULATED_SONG_LENGTH);
      
      if (newSongsPlayed > this.state.songsPlayed) {
        this.state.songsPlayed = newSongsPlayed;
        this.state.currentSongTitle = `Song ${newSongsPlayed + 1}`;
      }

      this.onUpdate?.(this.state);

      if (this.isComplete()) {
        await this.handleComplete();
      }
    }, 100);
  }

  /**
   * Handle timer completion
   */
  private async handleComplete(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.state) {
      this.state.isRunning = false;
      await this.saveState();
      this.onComplete?.();
    }
  }

  /**
   * Manually record a song (for external music detection)
   */
  async recordSong(title?: string): Promise<void> {
    if (!this.state || this.state.mode !== 'song') return;

    this.state.songsPlayed++;
    this.state.currentSongTitle = title;
    this.onUpdate?.(this.state);
    await this.saveState();

    if (this.isComplete()) {
      await this.handleComplete();
    }
  }
}

// Export singleton instance
export const rhythmicTimerService = new RhythmicTimerService();
