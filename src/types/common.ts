// Common type definitions for the application

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  personality: string;
  description: string;
  traits: string[];
  category: string;
  color?: string;
}

export interface BotConfiguration {
  id?: string;
  name: string;
  avatar: string;
  personality: string;
  description?: string;
  voiceSettings: VoiceSettings;
  nodes: BotNode[];
  edges: BotEdge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BotNode {
  id: string;
  type: 'intent' | 'response' | 'fallback';
  position: { x: number; y: number };
  data: {
    label: string;
    intent?: string;
    description?: string;
    trainingPhrases: string[];
    responses: string[];
    parameters?: Parameter[];
    isDefault?: boolean;
  };
}

export interface BotEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface Parameter {
  name: string;
  type: 'text' | 'number' | 'date' | 'entity';
  required: boolean;
  defaultValue?: string;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  configuration: Partial<BotConfiguration>;
  previewImage?: string;
}

export interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'deployed' | 'error';
  connectionKey?: string;
  deployedAt?: Date;
  errorMessage?: string;
  platform: 'google-assistant' | 'custom';
}

export interface AnalyticsData {
  sessionId: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

// Form validation types
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI Component types
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  context?: Record<string, any>;
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  language: string;
  notifications: boolean;
  autoSave: boolean;
  developerMode: boolean;
}