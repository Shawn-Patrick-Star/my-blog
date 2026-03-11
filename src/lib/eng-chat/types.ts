export type Role = 'user' | 'speaker' | 'system';

export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  meaning: string;
}

export interface HintItem {
  direction: string;
  suggested_sentence: string;
  key_words: string[];
}

export interface MonitorAnalysis {
  vocabulary: VocabularyItem[];
  grammar_point: string;
  hints: HintItem[];
}

export interface ErrorItem {
  original: string;
  corrected: string;
  reason: string;
}

export interface BetterExpressionItem {
  expression: string;
  explanation: string;
}

export interface UserCorrection {
  has_error: boolean;
  errors: ErrorItem[];
  better_expressions: BetterExpressionItem[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  // For Speaker messages
  monitorAnalysis?: MonitorAnalysis;
  isAnalyzing?: boolean;
  // For User messages
  userCorrection?: UserCorrection;
  isCorrecting?: boolean;
}

export type ApiMode = 'official' | 'custom';
export type UserLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Topic = 'Daily Life' | 'Travel' | 'Workplace' | 'Academic' | 'Custom';

export interface AppSettings {
  apiMode: ApiMode;
  apiKey: string;
  baseUrl: string;
  modelName: string;
  userLevel: UserLevel;
  topic: Topic;
  customTopic: string;
  hasCompletedOnboarding: boolean;
}
