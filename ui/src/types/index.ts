export interface User {
  id: number
  username: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PAID_STUDENT'
  status: 'ACTIVE' | 'LOCKED'
  created_at: string
  last_login?: string
}

export interface UserPreferences {
  user_id: number
  email_notification: boolean
  push_notification: boolean
  daily_reminder_time?: string
  theme: string
}

export interface Deck {
  id: number
  owner_id: number
  title: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: number
  deck_id: number
  front_content: string
  back_content: string
  image_url?: string
  created_at: string
}

export interface Class {
  id: number
  teacher_id: number
  name: string
  description?: string
  invite_code: string
  created_at: string
}

export interface Exam {
  id: number
  owner_id: number
  title: string
  duration_minutes: number
  created_at: string
}

export interface ExamAssignment {
  id: number
  class_id: number
  exam_id: number
  start_date: string
  due_date: string
  exam?: Exam
}

export interface Question {
  id: number
  exam_id: number
  content: string
  options_json: Record<string, any>
  correct_option: string
  score_value: number
}

export interface Badge {
  id: number
  name: string
  description?: string
  icon_url?: string
  criteria_json?: BadgeCriteria
  reward_xp: number
}

export interface BadgeCriteria {
  type: 'cards_learned' | 'streak' | 'total_xp' | 'decks_completed' | 'exams_passed'
  value: number
  operator?: 'gte' | 'lte' | 'eq'
}

export interface UserBadge {
  user_id: number
  badge_id: number
  status: 'LOCKED' | 'UNLOCKED' | 'CLAIMED'
  progress: number
  claimed_at?: string
  badge?: Badge
}

export interface UserStats {
  user_id: number
  total_xp: number
  current_streak: number
  longest_streak: number
  last_study_date?: string
  cards_learned: number
}

export interface StudyProgress {
  user_stats: UserStats
  algo_configs: AlgoConfigs
  cards_due_today: number
  cards_in_learning: number
  cards_mastered: number
}

export interface AlgoConfigs {
  user_id: number
  starting_ease: number
  interval_modifier: number
  easy_bonus: number
  hard_interval: number
}

export interface CardRetentionData {
  user_id: number
  card_id: number
  next_review?: string
  last_review?: string
  interval_days: number
  ease_factor: number
  repetition_count: number
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING'
}

export interface ExamResult {
  id: number
  user_id: number
  exam_id: number
  score: number
  submitted_at: string
  time_taken_seconds: number
}
