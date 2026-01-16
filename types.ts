
export enum TimeUnit {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES',
  SECONDS = 'SECONDS'
}

export enum SortOption {
  DATE_ASC = 'DATE_ASC',
  TITLE_ASC = 'TITLE_ASC',
  CREATED_DESC = 'CREATED_DESC'
}

export interface CountdownEvent {
  id: string;
  title: string;
  date: string; // ISO 8601 string or YYYY-MM-DD
  description?: string;
  type: 'holiday' | 'custom';
  color: string; // Tailwind color class or hex
  createdAt: number; // Timestamp
  // Enhanced holiday fields
  holidayType?: 'public' | 'traditional' | 'memorial'; // 法定假日、传统节日、纪念日
  daysOff?: number; // 放假天数
  traditions?: string[]; // 传统习俗
  greetings?: string; // 祝福语
}

export interface CreateEventFormData {
  title: string;
  date: string;
  time: string;
  color: string;
}
