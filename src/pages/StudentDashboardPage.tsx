import { useState, useEffect } from 'react';
import { Calendar, Clock, User, LogOut, TrendingUp, BookOpen } from 'lucide-react';
import { useStudentAuthStore } from '../stores/studentAuthStore';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'on_duty';
  period: {
    name: string;
    time_slot: string;
    faculty: {
      name: string;
    };
  };
}

interface SubjectStats {
  subject: string;
  faculty: string;
  total: number;
  present: number;
  absent: number;
  onDuty: number;
  percentage: number;
}

export default function StudentDashboardPage() {
  const { student, logout } = useStudentAuthStore();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    onDuty: 0,
    percentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student) {
      fetchAttendanceData();
    }
  }, [student]);

  const fetchAttendanceData = async () => {
    if (!student) return;

    try {
      setIsLoading(true);

      // Fetch attendance records with period and faculty information
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          date,
          status,
          period:periods (
            name,
            time_slot,
            faculty:faculty (
              name
            )
          )
        `)
        .eq('student_id', student.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const attendanceData = records || [];
      setAttendanceRecords(attendanceData);

      // Calculate statistics
      calculateStats(attendanceData);

    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (records: any[]) => {
    // Overall statistics
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const onDuty = records.filter(r => r.status === 'on_duty').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setOverallStats({ total, present, absent, onDuty, percentage });

    // Subject-wise statistics
    const subjectMap = new Map<string, {
      faculty: string;
      records: any[];
    }>();

    records.forEach(record => {
      if (record.period) {
        const subject = record.period.name;
        const faculty = record.period.faculty?.name || 'Unknown';
        
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { faculty, records: [] });
        }
        subjectMap.get(subject)!.records.push(record);
      }
    });

    const subjectStatsArray: SubjectStats[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
      const total = data.records.length;
      const present = data.records.filter(r => r.status === 'present').length;
      const absent = data.records.filter(r => r.status === 'absent').length;
      const onDuty = data.records.filter(r => r.status === 'on_duty').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        subject,
        faculty: data.faculty,
        total,
        present,
        absent,
        onDuty,
        percentage
      };
    });

    setSubjectStats(subjectStatsArray);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0VNekE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b6f84202e6b55e9d7df6e1aff46f2df993edcf97/300372602_367089768961179_2671218216233570040_n.jpg"
                alt="Attendo Logo"
                className="h-10 w-10 object-contain rounded-full mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">Attendo KRCT</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student?.name}</h2>
                <p className="text-gray-600">Roll Number: {student?.roll_number}</p>
                <p className="text-gray-600">Class: {student?.class_id}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Today's Date</span>
              </div>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <div className="flex items-center text-gray-600 mt-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>Current Time</span>
              </div>
              <p className="text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overall Attendance</h3>
            <TrendingUp className="h-5 w-5 text-red-500" />
          </div>
          
          <div className="flex items-center mb-6">
            <div className="relative w-32 h-32 mr-8">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={overallStats.percentage >= 75 ? "#10B981" : overallStats.percentage >= 50 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="3"
                  strokeDasharray={`${overallStats.percentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{overallStats.percentage}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 flex-1">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.total}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.present}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-red-600">{overallStats.absent}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg col-span-3">
                <p className="text-sm font-medium text-gray-500">On Duty</p>
                <p className="text-2xl font-bold text-yellow-600">{overallStats.onDuty}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <BookOpen className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h3>
          </div>
          
          {subjectStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjectStats.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {subject.faculty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {subject.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-medium">
                        {subject.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center font-medium">
                        {subject.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subject.percentage >= 75 
                            ? 'bg-green-100 text-green-800' 
                            : subject.percentage >= 50 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}