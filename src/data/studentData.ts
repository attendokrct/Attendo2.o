import { Student } from '../stores/attendanceStore';

// Class codes and student counts
const classStudentCounts: Record<string, number> = {
  'MECH': 60,
  'CIVIL': 55,
  'EEE': 50,
  'ECE-A': 65,
  'ECE-B': 65,
  'IT': 60,
  'AIDS-A': 70,
  'AIDS-B': 70,
  'AIML': 75,
  'CSE-A': 65,
  'CSE-B': 65,
  'CSE-C': 65,
};

// First names for random student generation
const firstNames = [
  'Aarav', 'Aditi', 'Amit', 'Ananya', 'Arjun', 'Divya', 'Gaurav', 'Ishaan',
  'Kavya', 'Krishna', 'Manish', 'Neha', 'Priya', 'Rahul', 'Ravi', 'Sanjay',
  'Shreya', 'Suresh', 'Tanvi', 'Vikram', 'Akshay', 'Deepika', 'Farhan', 'Geeta',
  'Harish', 'Jaya', 'Karan', 'Lakshmi', 'Mohan', 'Nandini', 'Pooja', 'Raj',
  'Sahil', 'Tanya', 'Uday', 'Varsha', 'Yash', 'Zara', 'Aditya', 'Bhavya',
];

// Last names for random student generation
const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Malhotra', 'Joshi',
  'Reddy', 'Nair', 'Iyer', 'Mehta', 'Shah', 'Agarwal', 'Desai', 'Bose', 'Rao',
  'Chopra', 'Das', 'Kapoor', 'Khanna', 'Mehra', 'Banerjee', 'Patil', 'Chatterjee',
  'Mukherjee', 'Saxena', 'Garg', 'Sinha', 'Bhat', 'Chauhan', 'Mishra', 'Kulkarni',
  'Roy', 'Chaudhary', 'Mathur', 'Anand', 'Pillai', 'Gill', 'Menon',
];

// Function to generate a random student
function generateRandomStudent(classCode: string, index: number): Student {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  
  // Create a roll number based on class code and index
  // e.g., CSE-A-001, MECH-042, etc.
  const rollNumber = `${classCode}-${String(index + 1).padStart(3, '0')}`;
  
  return {
    id: `${classCode}-${index}`,
    rollNumber,
    name,
  };
}

// Cache generated students to maintain consistency
const studentCache: Record<string, Student[]> = {};

// Get students for a specific class
export function generateStudentList(classCode: string): Student[] {
  // Return cached students if they exist
  if (studentCache[classCode]) {
    return studentCache[classCode];
  }
  
  // Get student count for this class or default to 40
  const studentCount = classStudentCounts[classCode] || 40;
  
  // Generate students for this class
  const students: Student[] = [];
  for (let i = 0; i < studentCount; i++) {
    students.push(generateRandomStudent(classCode, i));
  }
  
  // Cache the generated students
  studentCache[classCode] = students;
  
  return students;
}