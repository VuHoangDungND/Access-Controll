// User types
export interface User {
  id: string;
  username: string;
  name: string;
  idNumber: string;
  faceImage?: string;
  fingerPrint?: string;
  schedule?: Schedule[];
}

// Device (Door) types
export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  doorStatus: string;
  camStatus: string;
  rfidStatus: string;
  fingerPrintStatus: string;
}

// Schedule types
export interface Schedule {
  id: string;
  userId: string;
  deviceId: string;
  startTime: string;
  endTime: string;
}

// Permission types
export interface Permission {
  id: string;
  userId: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 

export interface HistoryEntry {
  id: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  type: 'entry' | 'exit';
  status: 'success' | 'failed';
} 