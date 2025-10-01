import { Link } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0VNekE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b6f84202e6b55e9d7df6e1aff46f2df993edcf97/300372602_367089768961179_2671218216233570040_n.jpg"
              alt="Attendo Logo"
              className="h-32 w-32 object-contain rounded-full shadow-lg bg-white p-4"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Attendo KRCT</h1>
          <p className="text-xl text-primary-100 mb-2">College Attendance Management System</p>
          <a
            className="text-primary-200 hover:text-primary-100 transition-colors"
            href="https://krct-pc.github.io/home/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by <strong>PROGRAMMING CLUB</strong>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Faculty Login */}
          <Link
            to="/login/faculty"
            className="group bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-200 transition-colors">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Faculty Login</h2>
              <p className="text-gray-600 mb-6">
                Access your dashboard to take attendance, view reports, and manage your classes.
              </p>
              <div className="inline-flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                Continue as Faculty
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Student Login */}
          <Link
            to="/login/student"
            className="group bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Login</h2>
              <p className="text-gray-600 mb-6">
                View your attendance records, track your progress, and stay updated with your academic performance.
              </p>
              <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                Continue as Student
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-primary-200 text-sm">
            © 2024 KRCT Programming Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}