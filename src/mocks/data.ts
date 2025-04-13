import { v4 as uuidv4 } from 'uuid';
import { User, Device, Permission, Schedule, HistoryEntry } from '../types';

// Helper function to create dates
const currentDate = new Date().toISOString();
const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

// Mock Users
export const users: User[] = [
  {
    id: '1',
    username: 'john.doe',
    name: 'John Doe',
    idNumber: 'ID001',
    faceImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    fingerPrint: 'https://cdn-icons-png.flaticon.com/512/823/823472.png',
  },
  {
    id: '2',
    username: 'jane.smith',
    name: 'Jane Smith',
    idNumber: 'ID002',
    faceImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    fingerPrint: 'https://cdn-icons-png.flaticon.com/512/823/823472.png',
  },
  {
    id: '3',
    username: 'michael.brown',
    name: 'Michael Brown',
    idNumber: 'ID003',
    faceImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    fingerPrint: 'https://cdn-icons-png.flaticon.com/512/823/823472.png',
  },
  {
    id: '4',
    username: 'emily.johnson',
    name: 'Emily Johnson',
    idNumber: 'ID004',
    faceImage: 'https://randomuser.me/api/portraits/women/4.jpg',
    fingerPrint: 'https://cdn-icons-png.flaticon.com/512/823/823472.png',
  },
  {
    id: '5',
    username: 'david.wilson',
    name: 'David Wilson',
    idNumber: 'ID005',
    faceImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    fingerPrint: 'https://cdn-icons-png.flaticon.com/512/823/823472.png',
  },
];


// Mock Schedules
export const schedules: Schedule[] = [
  {
    id: '1',
    userId: '1',
    deviceId: '1',
    startTime: currentDate,
    endTime: tomorrow,
  },
  {
    id: '2',
    userId: '2',
    deviceId: '2',
    startTime: currentDate,
    endTime: nextWeek,
  },
  {
    id: '3',
    userId: '3',
    deviceId: '3',
    startTime: tomorrow,
    endTime: nextWeek,
  },
];


