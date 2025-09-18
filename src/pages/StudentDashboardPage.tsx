import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuthStore } from '../stores/studentAuthStore';
import { useStudentAttendanceStore } from '../stores/studentAttendanceStore';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Clock, 
  LogOut, 
  GraduationCap, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  RefreshCw
} from 'lucide-react';
import AttendanceCircle from '../components/AttendanceCircle';

export default function StudentDashboardPage() {
  const { student, logout } = useStudentAuthStore();
  const { analytics, isLoading, error, fetchStudentAttendance, clearData } = useStudentAttendanceStore();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (student) {
      console.log('Student logged in:', student);
      fetchStudentAttendance(student.id);
    } else {
      clearData();
    }
  }, [student, fetchStudentAttendance, clearData]);

  useEffect(() => {
    // Set current date and time
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = () => {
    if (student) {
      fetchStudentAttendance(student.id);
    }
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { color: 'text-success-600', icon: TrendingUp, label: 'Excellent', bgColor: 'bg-success-50' };
    if (percentage >= 75) return { color: 'text-success-500', icon: CheckCircle, label: 'Good', bgColor: 'bg-success-50' };
    if (percentage >= 65) return { color: 'text-warning-500', icon: AlertCircle, label: 'Warning', bgColor: 'bg-warning-50' };
    return { color: 'text-error-500', icon: TrendingDown, label: 'Critical', bgColor: 'bg-error-50' };
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-success-600" />
              <span className="text-xl font-bold text-success-800">Attendo KRCT - Student</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                  <span className="text-success-800 font-medium">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{student.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-success-100 p-3 rounded-full">
                <User className="w-8 h-8 text-success-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome, {student.name}
                </h1>
                <p className="text-gray-600">
                  Roll Number: {student.roll_number} | Class: {student.class?.name || 'Not assigned'}
                </p>
                <p className="text-sm text-gray-500">Class Code: {student.class?.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{currentDate}</p>
              <p className="text-lg font-semibold text-gray-700">{currentTime}</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your attendance data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error loading attendance data:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center text-sm bg-error-100 hover:bg-error-200 px-3 py-1 rounded transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {!isLoading && analytics && (
          <>
            {/* Overall Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overall Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overallPercentage.toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const status = getAttendanceStatus(analytics.overallPercentage);
                        const Icon = status.icon;
                        return (
                          <>
                            <Icon className={`h-4 w-4 mr-1 ${status.color}`} />
                            <span className={`text-sm ${status.color}`}>{status.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="bg-success-100 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalClasses}</p>
                    <p className="text-sm text-gray-500 mt-1">All subjects</p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-full">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Present</p>
                    <p className="text-2xl font-bold text-success-600">{analytics.totalPresent}</p>
                    <p className="text-sm text-gray-500 mt-1">Classes attended</p>
                  </div>
                  <div className="bg-success-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Absent</p>
                    <p className="text-2xl font-bold text-error-600">{analytics.totalAbsent}</p>
                    <p className="text-sm text-gray-500 mt-1">Classes missed</p>
                  </div>
                  <div className="bg-error-100 p-3 rounded-full">
                    <XCircle className="w-6 h-6 text-error-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Attendance Circle */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Attendance Overview</h2>
                <div className="flex justify-center mb-6">
                  <AttendanceCircle percentage={analytics.overallPercentage} size={160} strokeWidth={12} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="w-3 h-3 bg-success-500 rounded-full mx-auto mb-1"></div>
                    <p className="font-medium">{analytics.totalPresent}</p>
                    <p className="text-gray-500">Present</p>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-error-500 rounded-full mx-auto mb-1"></div>
                    <p className="font-medium">{analytics.totalAbsent}</p>
                    <p className="text-gray-500">Absent</p>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-warning-500 rounded-full mx-auto mb-1"></div>
                    <p className="font-medium">{analytics.totalOnDuty}</p>
                    <p className="text-gray-500">On Duty</p>
                  </div>
                </div>
              </div>

              {/* Recent Records */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Recent Attendance</h2>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analytics.recentRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {record.status === 'present' ? (
                            <CheckCircle className="h-4 w-4 text-success-500" />
                          ) : record.status === 'on_duty' ? (
                            <Clock className="h-4 w-4 text-warning-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-error-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {record.period.faculty.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {record.period.time_slot} • {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-success-100 text-success-700' :
                        record.status === 'on_duty' ? 'bg-warning-100 text-warning-700' :
                        'bg-error-100 text-error-700'
                      }`}>
                        {record.status === 'on_duty' ? 'On Duty' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject-wise Attendance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Subject-wise Attendance</h2>
              <div className="space-y-4">
                {analytics.subjectWise.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{subject.facultyName}</h3>
                        <p className="text-sm text-gray-600">{subject.facultyDesignation}</p>
                        <p className="text-xs text-gray-500">{subject.facultyDepartment}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{subject.percentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500">
                          {subject.presentCount + subject.onDutyCount}/{subject.totalClasses} classes
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          subject.percentage >= 85 ? 'bg-success-500' : 
                          subject.percentage >= 75 ? 'bg-success-400' :
                          subject.percentage >= 65 ? 'bg-warning-500' : 'bg-error-500'
                        }`}
                        style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                        Present: {subject.presentCount}
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-error-500 rounded-full mr-1"></div>
                        Absent: {subject.absentCount}
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-warning-500 rounded-full mr-1"></div>
                        On Duty: {subject.onDutyCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!isLoading && !error && !analytics && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data</h3>
            <p className="text-gray-500 mb-4">Your attendance records will appear here once classes begin.</p>
            <button 
              onClick={handleRefresh}
              className="btn btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-4">
          <p className="text-gray-500 text-sm">
            Attendo KRCT - Smart Attendance Management System
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Powered by Programming Club 24
          </p>
        </div>
      </div>
    </div>
  );
}