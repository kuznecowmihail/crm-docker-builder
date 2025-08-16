// Типы для системной информации
export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

// Типы для диалогов файлов
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
  message?: string;
  securityScopedBookmarks?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  message?: string;
  nameFieldLabel?: string;
  showsTagField?: boolean;
  properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'dontAddToRecent' | 'showOverwriteConfirmation'>;
  securityScopedBookmarks?: boolean;
}

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

// Типы для файловой системы
export interface FileSystemError {
  message: string;
  code?: string;
}
