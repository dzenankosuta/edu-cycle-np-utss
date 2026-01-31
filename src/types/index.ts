export interface ClassPeriod {
  class: string;
  start: string;
  end: string;
}

export interface Schedule {
  firstShift: ClassPeriod[];
  secondShift: ClassPeriod[];
}

export interface ImageItem {
  id: string;
  url: string;
  active: boolean;
  order: number;
}

export interface AdminUser {
  email: string;
  role: 'admin';
  createdAt: number;
}
