import api from './httpClient';

export interface AnalyzeMoodInput {
  input: string;
  method: 'text' | 'audio' | 'image' | string;
  user_id?: string;
}

export interface AnalyzeMoodResult {
  session_id: string;
  mood: string;
  intensity: number;
  confidence: number;
  alternative_moods?: string[];
  reasoning?: string;
  suggested_genre?: string;
}

export interface GenerateMusicInput {
  session_id: string;
  mood: string;
  intensity: number;
  genre_preference?: string;
}

export interface TrackInfo {
  id: string;
  title: string;
  audio_url: string;
  duration: number;
  genre?: string;
  tempo?: number;
}

export interface GenerateMusicResult {
  track: TrackInfo;
  session_id: string;
  cached: boolean;
}

export interface GetMusicInput {
  input: string;
  method?: 'text' | 'audio' | 'image' | string;
  user_id?: string;
}

export interface GetMusicResult {
  session_id: string;
  mood_analysis: {
    mood: string;
    intensity: number;
    confidence: number;
    reasoning?: string;
  };
  track: TrackInfo;
  from_cache: boolean;
}

export interface FeedbackInput {
  session_id: string;
  liked: boolean;
  rating?: number;
  comment?: string;
  listening_duration?: number;
}

export interface HistoryItem {
  session_id: string;
  mood: string;
  intensity: number;
  track?: { id?: string; title?: string; duration?: number } | null;
  feedback?: unknown;
  listening_duration?: number;
  created_at?: string;
}

export interface HistoryResult {
  history: HistoryItem[];
  total: number;
  has_more: boolean;
}

export interface StatsResult {
  total_sessions: number;
  total_tracks_cached: number;
  average_rating: number;
  mood_distribution: { mood: string; count: number }[];
  cache_hit_rate: number;
  generated_at: string;
}

export const RadioAIService = {
  analyzeMood: async (payload: AnalyzeMoodInput): Promise<AnalyzeMoodResult> => {
    const { data } = await api.post('/radio-ai/analyze-mood', payload);
    return data.data as AnalyzeMoodResult;
  },

  generateMusic: async (payload: GenerateMusicInput): Promise<GenerateMusicResult> => {
    const { data } = await api.post('/radio-ai/generate-music', payload);
    return data.data as GenerateMusicResult;
  },

  getMusic: async (payload: GetMusicInput): Promise<GetMusicResult> => {
    const { data } = await api.post('/radio-ai/get-music', payload);
    return data.data as GetMusicResult;
  },

  submitFeedback: async (payload: FeedbackInput): Promise<{ message: string; session_id: string }> => {
    const { data } = await api.post('/radio-ai/feedback', payload);
    return data.data as { message: string; session_id: string };
  },

  getHistory: async (userId: string, params?: { limit?: number; offset?: number }): Promise<HistoryResult> => {
    const { data } = await api.get(`/radio-ai/history/${encodeURIComponent(userId)}`, { params });
    return data.data as HistoryResult;
  },

  getStats: async (): Promise<StatsResult> => {
    const { data } = await api.get('/radio-ai/stats');
    return data.data as StatsResult;
  },
};


