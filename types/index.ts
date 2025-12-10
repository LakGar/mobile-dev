export type NotificationOption = "enter" | "exit" | "both";

export interface Zone {
  id: number;
  title: string;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  radius: number;
  icon: string;
  color: string;
  description?: string;
  notificationOption: NotificationOption;
  notificationText: string;
  image?: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  username: string;
  name: string;
  bio: string;
  profileImage: any;
  email: string;
  phone?: string;
  gender?: string;
  streak: number;
}

export type ActivityType = "enter" | "exit";

export interface Activity {
  id: number;
  zoneId: number;
  zoneName: string;
  type: ActivityType;
  time: string;
  timestamp: number;
  icon: string;
}

export interface OverviewStats {
  completed: number;
  scheduled: number;
  pending: number;
  allTasks: number;
}

