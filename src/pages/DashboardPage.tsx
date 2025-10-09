import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Period {
  id: string;
  name: string;
  time_slot: string;
  weekday: string;
  class: {
    code: string;
    name: string;
  };
}

interface AttendanceStats {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
}

export default function DashboardPage() {
  const { faculty } = useAuthStore();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [todayPeriods, setTodayPeriods] = useState<Period[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (faculty) {
      fetchPeriods();
      fetchStats();
    }
  }, [faculty]);

  const fetchPeriods = async () => {
    if (!faculty) return;

    try {
      const { data, error } = await supabase
        .from('periods')
        .select(`
          id,
          name,
          time_slot,
          weekday,
          class:classes (
            code,
            name
          )
        `)
        .eq('faculty_id', faculty.id)
        .order('time_slot');

      if (error) throw error;

      const allPeriods = data || [];
      setPeriods(allPeriods);

      // Filter today's periods
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaysPeriods = allPeriods.filter(period => period.weekday === today);
      setTodayPeriods(todaysPeriods);

    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!faculty) return;

    try {
      // Get total classes count
      const { count: classCount } = await supabase
        .from('periods')
        .select('*', { count: 'exact', head: true })
        .eq('faculty_id', faculty.id);

      // Get total students across all classes
      const { data: classIds } = await supabase
        .from('periods')
        .select('class_id')
        .eq('faculty_id', faculty.id);

      let totalStudents = 0;
      if (classIds && classIds.length > 0) {
        const uniqueClassIds = [...new Set(classIds.map(p => p.class_id))];
        
        for (const classId of uniqueClassIds) {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId);
          
          totalStudents += count || 0;
        }
      }

      // Calculate average attendance (simplified)
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('status, period:periods!inner(faculty_id)')
        .eq('period.faculty_id', faculty.id);

      let averageAttendance = 0;
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(record => record.status === 'present').length;
        averageAttendance = Math.round((presentCount / attendanceData.length) * 100);
      }

      setStats({
        totalClasses: classCount || 0,
        totalStudents,
        averageAttendance
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {faculty?.name}!</h1>
        <p className="text-gray-600 mt-2">{faculty?.designation} - {faculty?.department}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Classes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <span className="ml-2 text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {todayPeriods.length > 0 ? (
            <div className="grid gap-4">
              {todayPeriods.map((period) => (
                <div key={period.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-4">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{period.name}</h3>
                      <p className="text-sm text-gray-600">{period.class.name} ({period.class.code})</p>
                      <p className="text-sm text-gray-500">{period.time_slot}</p>
                    </div>
                  </div>
                  <Link
                    to={`/attendance/${period.id}/${period.class.code}`}
                    className="btn btn-primary"
                  >
                    Take Attendance
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* All Periods */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Your Classes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {period.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.class.name} ({period.class.code})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.weekday}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.time_slot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/attendance/${period.id}/${period.class.code}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Take Attendance
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}