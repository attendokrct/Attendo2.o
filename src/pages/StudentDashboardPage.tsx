import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuthStore } from '../stores/studentAuthStore';
import { User, BookOpen, Calendar, Clock, LogOut, GraduationCap, BarChart3 } from 'lucide-react';

export default function StudentDashboardPage() {
  const { student, logout } = useStudentAuthStore();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in">
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in animate-delay-100">
            <div className="flex items-center space-x-4">
              <div className="bg-success-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Class</h3>
                <p className="text-gray-600">{student.class?.name || 'Not assigned'}</p>
                <p className="text-sm text-gray-500">Code: {student.class?.code || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in animate-delay-200">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Today's Date</h3>
                <p className="text-gray-600">{currentDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in animate-delay-300">
            <div className="flex items-center space-x-4">
              <div className="bg-warning-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
                <p className="text-gray-600">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in animate-delay-400">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-success-600" />
              <h2 className="text-xl font-bold text-gray-800">Attendance Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-success-800 mb-2">Overall Attendance</h3>
                <p className="text-success-700">
                  Your attendance records are tracked by your faculty members. 
                  Check with your instructors for detailed attendance reports.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Attendance Tips</h3>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Attend all classes regularly</li>
                  <li>• Inform faculty in advance for planned absences</li>
                  <li>• Maintain at least 75% attendance for eligibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in animate-delay-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">View Class Schedule</h3>
                <p className="text-gray-600 text-sm">Check your daily class timetable and room assignments</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Contact Faculty</h3>
                <p className="text-gray-600 text-sm">Get in touch with your instructors for any queries</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Academic Calendar</h3>
                <p className="text-gray-600 text-sm">View important dates, exams, and holidays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8 animate-fade-in animate-delay-600">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Personal Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {student.name}</p>
                <p><span className="font-medium">Roll Number:</span> {student.roll_number}</p>
                <p><span className="font-medium">Email:</span> {student.email || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Academic Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Class:</span> {student.class?.name || 'Not assigned'}</p>
                <p><span className="font-medium">Class Code:</span> {student.class?.code || 'N/A'}</p>
                <p><span className="font-medium">Department:</span> {student.class?.name?.includes('CSE') ? 'Computer Science' : student.class?.name?.includes('IT') ? 'Information Technology' : student.class?.name?.includes('ECE') ? 'Electronics & Communication' : 'Engineering'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4">
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