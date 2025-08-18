// Типы для уведомлений

// Типы для уведомлений
export interface NotificationOptions {
  title: string;
  body: string;
  subtitle?: string;
  silent?: boolean;
  icon?: string;
  hasReply?: boolean;
  timeoutType?: 'default' | 'never';
  replyPlaceholder?: string;
  sound?: string;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: 'button';
    text: string;
  }>;
  closeButtonText?: string;
}
