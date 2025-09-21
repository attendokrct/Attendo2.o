import React from 'react';
import { useStudentAuthStore } from '../stores/studentAuthStore';
import Layout from '../components/Layout';
import { User, BookOpen, Calendar, Clock } from 'lucide-react';

export default function StudentDashboardPage() {
  const { student } = useStudentAuthStore();

  if (!student) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we load your dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {student.name}
              </h1>
              <p className="text-gray-600">
                Roll Number: {student.roll_number} | Class: {student.class?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Class</h3>
                <p className="text-gray-600">{student.class?.name || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Today's Date</h3>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
                <p className="text-gray-600">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Welcome to your student dashboard. Here you can view your attendance records,
            class information, and other important details.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Actions</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• View your attendance history</li>
              <li>• Check class schedules</li>
              <li>• Update your profile information</li>
              <li>• Contact your instructors</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}