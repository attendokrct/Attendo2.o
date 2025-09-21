import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0VNekE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b6f84202e6b55e9d7df6e1aff46f2df993edcf97/300372602_367089768961179_2671218216233570040_n.jpg"
              alt="Attendo Logo"
              className="h-32 w-32 object-contain rounded-full shadow-md bg-white p-3"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Attendo KRCT</h1>
          <p className="text-xl text-primary-100 mb-8">Smart way of attendance</p>
          <a
            className="text-primary-200 hover:text-primary-100 transition-colors"
            href="https://krct-pc.github.io/home/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by <strong>PROGRAMMING CLUB 24</strong>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Faculty Login Card */}
          <Link
            to="/login/faculty"
            className="group bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="bg-primary-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Users className="h-12 w-12 text-primary-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Faculty Login</h2>
              <p className="text-gray-600 mb-4">
                Access your dashboard to manage attendance, view timetables, and track student progress.
              </p>
              <div className="bg-primary-50 p-3 rounded-lg">
                <p className="text-sm text-primary-700 font-medium">
                  For Teachers & Professors
                </p>
              </div>
            </div>
          </Link>

          {/* Student Login Card */}
          <Link
            to="/login/student"
            className="group bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="bg-success-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-success-200 transition-colors">
                <GraduationCap className="h-12 w-12 text-success-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Student Login</h2>
              <p className="text-gray-600 mb-4">
                View your attendance records, track your progress, and monitor your academic performance.
              </p>
              <div className="bg-success-50 p-3 rounded-lg">
                <p className="text-sm text-success-700 font-medium">
                  For Students
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
    {/* Custom logo */}
    <img 
      src="src/components/newpc.png" 
      alt="Programming Club 24 Logo" 
      className="h-16 w-16 mx-auto mb-4 object-contain"
    />

    <h2 className="text-white text-lg font-semibold mb-4">Programming Club 24</h2>

    <ul className="text-white/90 text-sm space-y-2">
      <li>
        <span className="font-bold">Rohit CSE(AIML)</span> - President
      </li>
      <li>
        <span className="font-bold">Harish K IT</span> - Media Head
      </li>
      <li>
        <span className="font-bold">Jeevitha S CSE(AIML)</span> - Data Analyst
      </li>
      <li>
        <span className="font-bold">Amudeshwar H IT</span> - Ideabin Head
      </li>
    </ul>
  </div>
</div>

      </div>
    </div>
  );
}