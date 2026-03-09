export type Category = '개인' | '업무' | '쇼핑' | '회의' | '기타';
export type Priority = '높음' | '보통' | '낮음';

export const CATEGORIES: Category[] = ['개인', '업무', '쇼핑', '회의', '기타'];
export const PRIORITIES: Priority[] = ['높음', '보통', '낮음'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '개인': '#4CAF50',
  '업무': '#2196F3',
  '쇼핑': '#FF9800',
  '회의': '#9C27B0',
  '기타': '#9E9E9E',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  '높음': '#F44336',
  '보통': '#FF9800',
  '낮음': '#8BC34A',
};

export const PRIORITY_ICONS: Record<Priority, string> = {
  '높음': '🔴',
  '보통': '🟡',
  '낮음': '🟢',
};

export type Filter = 'all' | 'today' | Category;

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  createdAt: number;
  dueDate?: number;
}

export type DueDateStatus = 'far' | 'soon' | 'today' | 'overdue' | null;

function getTodayMidnight(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function getDueDateStatus(dueDate?: number): DueDateStatus {
  if (dueDate === undefined) return null;
  const todayMs = getTodayMidnight();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((dueDate - todayMs) / MS_PER_DAY);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 2) return 'soon';
  return 'far';
}

export function formatDueDateLabel(dueDate: number): string {
  const todayMs = getTodayMidnight();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((dueDate - todayMs) / MS_PER_DAY);
  if (diffDays === 0) return 'D-Day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

export function toMidnightTimestamp(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getTime();
}

export function timestampToDateStr(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isTodayDue(todo: Todo): boolean {
  if (todo.dueDate === undefined) return false;
  return getDueDateStatus(todo.dueDate) === 'today';
}
