import React, { useEffect, useState } from 'react';
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
  Users
} from 'lucide-react';
import AttendanceCircle from '../components/AttendanceCircle';

export default function StudentDashboardPage() {
  const { student, logout } = useStudentAuthStore();
  const { analytics, isLoading, error, fetchStudentAttendance } = useStudentAttendanceStore();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (student) {
      fetchStudentAttendance(student.id);
    }
  }, [student, fetchStudentAttendance]);

  useEffect(() => {
    // Set current date
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // Update time every minute
    const updateTime = () => {
      const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentTime(time);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { color: 'text-success-600', icon: TrendingUp, label: 'Excellent' };
    if (percentage >= 75) return { color: 'text-success-500', icon: CheckCircle, label: 'Good' };
    if (percentage >= 65) return { color: 'text-warning-500', icon: AlertCircle, label: 'Warning' };
    return { color: 'text-error-500', icon: TrendingDown, label: 'Critical' };
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
                className="flex items-center text-gray-600 hover:text-gray-900"
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
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{currentDate}</p>
              <p className="text-lg font-semibold text-gray-700">{currentTime}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
          </div>
        ) : error ? (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : analytics ? (
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

            {/* Attendance Visualization and Subject-wise */}
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

              {/* Subject-wise Attendance */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Subject-wise Attendance</h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {analytics.subjectWise.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{subject.facultyName}</h3>
                          <p className="text-sm text-gray-500">{subject.facultyDesignation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{subject.percentage.toFixed(1)}%</p>
                          <p className="text-sm text-gray-500">{subject.presentCount + subject.onDutyCount}/{subject.totalClasses}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            subject.percentage >= 75 ? 'bg-success-500' : 
                            subject.percentage >= 65 ? 'bg-warning-500' : 'bg-error-500'
                          }`}
                          style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Present: {subject.presentCount}</span>
                        <span>Absent: {subject.absentCount}</span>
                        <span>On Duty: {subject.onDutyCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Trend and Recent Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Attendance Trend</h2>
                <div className="space-y-4">
                  {analytics.monthlyData.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{month.month}</span>
                          <span className="text-sm font-bold text-gray-900">{month.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              month.percentage >= 75 ? 'bg-success-500' : 
                              month.percentage >= 65 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            style={{ width: `${Math.min(month.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>P: {month.present}</span>
                          <span>A: {month.absent}</span>
                          <span>OD: {month.onDuty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attendance Records */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Attendance</h2>
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
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data</h3>
            <p className="text-gray-500">Your attendance records will appear here once classes begin.</p>
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