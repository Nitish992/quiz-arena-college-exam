
// Dummy data to simulate backend responses

export type User = {
  id: string;
  roll_number: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  email?: string;
  semester?: string;
  batch?: string;
  dob_hash?: string;
};

export type Question = {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  semester: string;
};

export type Quiz = {
  _id: string;
  name: string;
  semester: string;
  time_limit: number;
  start_time: string;
  end_time: string;
  instructions: string;
  question_ids: string[];
  total_questions: number;
  results_published: boolean;
};

export type Result = {
  quiz_id: string;
  roll_number: string;
  score: number;
  total_questions: number;
};

export const users: User[] = [
  { 
    id: "u1",
    roll_number: "CS23A001", 
    role: "student", 
    name: "Alex Johnson",
    semester: "6th", 
    batch: "2023-26", 
    dob_hash: "2000-01-15" // Using actual dates for simplified demo
  },
  { 
    id: "u2",
    roll_number: "CS23A002", 
    role: "student", 
    name: "Emma Wilson",
    semester: "6th", 
    batch: "2023-26", 
    dob_hash: "2000-03-22" 
  },
  { 
    id: "u3",
    roll_number: "prof123", 
    role: "teacher", 
    name: "Dr. Sarah Miller",
    email: "sarah.miller@college.edu"
  },
  { 
    id: "u4",
    roll_number: "admin001", 
    role: "admin", 
    name: "Admin User",
    email: "admin@college.edu"
  }
];

export const questions: Question[] = [
  {
    _id: "q1",
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correct_answer: "A",
    semester: "6th"
  },
  {
    _id: "q2",
    question: "Which data structure operates on LIFO principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correct_answer: "B",
    semester: "6th"
  },
  {
    _id: "q3",
    question: "What does HTTP stand for?",
    options: ["Hypertext Transfer Protocol", "Hypertext Test Protocol", "High Transfer Text Protocol", "Hypertext Transfer Procedure"],
    correct_answer: "A",
    semester: "6th"
  },
  {
    _id: "q4",
    question: "Which sorting algorithm has the worst case complexity of O(n²)?",
    options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"],
    correct_answer: "C",
    semester: "6th"
  },
  {
    _id: "q5",
    question: "In JavaScript, which method is used to add elements to the end of an array?",
    options: ["push()", "append()", "add()", "insert()"],
    correct_answer: "A",
    semester: "6th"
  }
];

export const quizzes: Quiz[] = [
  {
    _id: "quiz1",
    name: "Compiler Design Quiz",
    semester: "6th",
    time_limit: 30,
    start_time: "2025-04-13T09:00:00Z",
    end_time: "2025-04-30T17:00:00Z",
    instructions: "No external resources allowed. Answer all questions.",
    question_ids: ["q1", "q2", "q3", "q4", "q5"],
    total_questions: 5,
    results_published: true
  },
  {
    _id: "quiz2",
    name: "Database Management Systems",
    semester: "6th",
    time_limit: 45,
    start_time: "2025-04-14T10:00:00Z",
    end_time: "2025-04-30T18:00:00Z",
    instructions: "You may use a calculator. No collaboration allowed.",
    question_ids: ["q1", "q3", "q5"],
    total_questions: 3,
    results_published: false
  }
];

export const results: Result[] = [
  {
    quiz_id: "quiz1",
    roll_number: "CS23A001",
    score: 4,
    total_questions: 5
  }
];

export const batches = [
  { id: "b1", name: "2023-26", current_semester: "6th" },
  { id: "b2", name: "2022-25", current_semester: "8th" },
  { id: "b3", name: "2024-27", current_semester: "4th" }
];

export const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
