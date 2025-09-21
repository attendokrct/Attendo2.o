export const facultyData = [
  {
    id: 'faculty1',
    name: 'Dr. Arul Mani',
    designation: 'Assistant Professor',
    department: 'Department of Physics',
    email: 'fac1@krct.ac.in',
    password: '123456', // In a real app, passwords would be hashed
  },
  {
    id: 'faculty2',
    name: 'Mr. Saravana Kumar',
    designation: 'Assistant Professor',
    department: 'Department of Maths',
    email: 'fac2@krct.ac.in',
    password: '123456',
  },
  {
    id: 'faculty3',
    name: 'Prof. Anil Gupta',
    designation: 'Professor',
    department: 'Department of Electronics',
    email: 'anil@example.com',
    password: 'password123',
  },
];

// Faculty timetable data structure
export interface PeriodInfo {
  id: string;
  name: string;
  timeSlot: string;
  classCode: string;
  className: string;
}

// Map faculty ID to their timetable
export const facultyTimetable: Record<string, PeriodInfo[]> = {
  faculty1: [
    { id: 'p1', name: 'Period 1', timeSlot: '8:45 AM - 9:45 AM', classCode: 'CSE-A', className: 'CSE A' },
    { id: 'p2', name: 'Period 2', timeSlot: '9:45 AM - 10:45 AM', classCode: 'ECE-A', className: 'ECE A' },
    { id: 'p3', name: 'Period 3', timeSlot: '11:00 AM - 12:00 PM', classCode: 'MECH', className: 'Mechanical' },
    { id: 'p4', name: 'Period 4', timeSlot: '1:00 PM - 2:00 PM', classCode: 'CIVIL', className: 'Civil' },
    { id: 'p5', name: 'Period 5', timeSlot: '2:00 PM - 2:50 PM', classCode: 'IT', className: 'Information Technology' },
    { id: 'p6', name: 'Period 6', timeSlot: '3:05 PM - 3:05 PM', classCode: 'EEE', className: 'Electrical & Electronics' },
    { id: 'p7', name: 'Period 7', timeSlot: '4:00 PM - 4:45 PM', classCode: 'AIDS-A', className: 'AI & DS' },
  ],
  faculty2: [
    { id: 'p1', name: 'Period 1', timeSlot: '8:45 AM - 9:45 AM', classCode: 'CSE-B', className: 'CSE B' },
    { id: 'p2', name: 'Period 2', timeSlot: '9:45 AM - 10:45 AM', classCode: 'ECE-B', className: 'ECE B' },
    { id: 'p3', name: 'Period 3', timeSlot: '11:00 AM - 12:00 PM', classCode: 'AIML', className: 'AI & ML' },
    { id: 'p4', name: 'Period 4', timeSlot: '1:00 PM - 2:00 PM', classCode: 'CSE-C', className: 'CSE C' },
    { id: 'p5', name: 'Period 5', timeSlot: '2:00 PM - 2:50 PM', classCode: 'AIDS-B', className: 'AI & Data Science B' },
    { id: 'p6', name: 'Period 6', timeSlot: '3:05 PM - 3:05 PM', classCode: 'CSE-A', className: 'CSE A' },
    { id: 'p7', name: 'Period 7', timeSlot: '4:00 PM - 4:45 PM', classCode: 'IT', className: 'Information Technology' },
  ],
  faculty3: [
    { id: 'p1', name: 'Period 1', timeSlot: '9:00 AM - 10:00 AM', classCode: 'ECE-A', className: 'ECE A' },
    { id: 'p2', name: 'Period 2', timeSlot: '10:00 AM - 11:00 AM', classCode: 'AIDS-A', className: 'AI & Data Science A' },
    { id: 'p3', name: 'Period 3', timeSlot: '11:15 AM - 12:15 PM', classCode: 'ECE-B', className: 'ECE B' },
    { id: 'p4', name: 'Period 4', timeSlot: '12:15 PM - 1:15 PM', classCode: 'EEE', className: 'Electrical & Electronics' },
    { id: 'p5', name: 'Period 5', timeSlot: '2:00 PM - 3:00 PM', classCode: 'AIDS-B', className: 'AI & Data Science B' },
    { id: 'p6', name: 'Period 6', timeSlot: '3:00 PM - 4:00 PM', classCode: 'MECH', className: 'Mechanical' },
    { id: 'p7', name: 'Period 7', timeSlot: '4:15 PM - 5:15 PM', classCode: 'AIML', className: 'AI & ML' },
  ],
};

// Get timetable for a faculty
export function getFacultyTimetable(facultyId: string): PeriodInfo[] {
  return facultyTimetable[facultyId] || [];
}