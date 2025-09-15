import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, BookOpen, TrendingUp, TrendingDown, Minus, GraduationCap, LogOut } from 'lucide-react';
import { useStudentAuthStore } from '../stores/studentAuthStore';
import AttendanceCircle from '../components/AttendanceCircle';
import { supabase } from '../lib/supabase';

interface SubjectAttendance {
  subject_name: string;
  faculty_name: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  on_duty_count: number;
  percentage: number;
}

interface OverallStats {
  total_classes: number;
  present_count: number;
  absent_count: number;
  on_duty_count: number;
  percentage: number;
}

export default function StudentDashboardPage() {
  const { student, logout } = useStudentAuthStore();
  const navigate = useNavigate();
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    total_classes: 0,
    present_count: 0,
    absent_count: 0,
    on_duty_count: 0,
    percentage: 0
  });
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set current date and time
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

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

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!student) return;

      try {
        console.log('Fetching attendance for student:', student);

        // First, let's try a simpler query to see if we can get any records
        const { data: testRecords, error: testError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', student.id);

        console.log('Test records for student:', testRecords, 'Error:', testError);

        // Fetch attendance records from current table
        const { data: currentRecords, error: currentError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', student.id);

        // Fetch attendance records from history table
        const { data: historyRecords, error: historyError } = await supabase
          .from('attendance_history')
          .select('*')
          .eq('student_id', student.id);

        console.log('Current records:', currentRecords?.length || 0);
        console.log('History records:', historyRecords?.length || 0);

        // Combine all records
        const allAttendanceRecords = [...(currentRecords || []), ...(historyRecords || [])];
        console.log('Total attendance records:', allAttendanceRecords.length);

        if (allAttendanceRecords.length === 0) {
          console.log('No attendance records found for student');
          setSubjectAttendance([]);
          setOverallStats({
            total_classes: 0,
            present_count: 0,
            absent_count: 0,
            on_duty_count: 0,
            percentage: 0
          });
          return;
        }

        // Get unique period IDs to fetch period details
        const periodIds = [...new Set(allAttendanceRecords.map(record => record.period_id))];
        console.log('Unique period IDs:', periodIds);

        // Fetch period details with faculty information
        const { data: periodsData, error: periodsError } = await supabase
          .from('periods')
          .select(`
            id,
            name,
            time_slot,
            faculty:faculty_id (
              name
            )
          `)
          .in('id', periodIds);

        console.log('Periods data:', periodsData, 'Error:', periodsError);

        if (!periodsData || periodsData.length === 0) {
          console.log('No period data found');
          return;
        }

        // Create a map of period ID to period details
        const periodMap = new Map();
        periodsData.forEach(period => {
          if (period.faculty) {
            periodMap.set(period.id, {
              name: period.name,
              time_slot: period.time_slot,
              faculty_name: period.faculty.name
            });
          }
        });

        console.log('Period map:', periodMap);

        // Filter attendance records to only include those with valid periods
        const validAttendanceRecords = allAttendanceRecords.filter(record => 
          periodMap.has(record.period_id)
        );

        console.log('Valid attendance records:', validAttendanceRecords.length);

        // Remove duplicates (same period and date)
        const uniqueRecords = validAttendanceRecords.filter((record, index, self) => 
          index === self.findIndex(r => r.date === record.date && r.period_id === record.period_id)
        );

        console.log('Unique records after deduplication:', uniqueRecords.length);

        // Group by period (subject)
        const subjectMap = new Map<string, {
          faculty_name: string;
          subject_name: string;
          records: any[];
        }>();

        uniqueRecords.forEach(record => {
          const periodInfo = periodMap.get(record.period_id);
          if (!periodInfo) {
            return;
          }
          
          const facultyName = periodInfo.faculty_name;
          const periodName = periodInfo.name || 'Unknown Period';
          const timeSlot = periodInfo.time_slot || '';
          const subjectKey = record.period_id; // Use period_id as unique key
          
          if (!subjectMap.has(subjectKey)) {
            subjectMap.set(subjectKey, {
              faculty_name: facultyName,
              subject_name: `${periodName}${timeSlot ? ` (${timeSlot})` : ''}`,
              records: []
            });
          }
          
          const subjectData = subjectMap.get(subjectKey)!;
          subjectData.records.push(record);
        });

        console.log('Subject map:', subjectMap);

        // Calculate subject-wise attendance statistics
        const subjectStats: SubjectAttendance[] = Array.from(subjectMap.entries()).map(([subjectKey, data]) => {
          const total_classes = data.records.length;
          const present_count = data.records.filter(r => r.status === 'present').length;
          const absent_count = data.records.filter(r => r.status === 'absent').length;
          const on_duty_count = data.records.filter(r => r.status === 'on_duty').length;
          const percentage = total_classes > 0 ? ((present_count + on_duty_count) / total_classes) * 100 : 0;

          return {
            subject_name: data.subject_name,
            faculty_name: data.faculty_name,
            total_classes,
            present_count,
            absent_count,
            on_duty_count,
            percentage
          };
        });

        console.log('Subject stats:', subjectStats);

        setSubjectAttendance(subjectStats);

        // Calculate overall attendance statistics
        const totalClasses = uniqueRecords.length;
        const totalPresent = uniqueRecords.filter(r => r.status === 'present').length;
        const totalAbsent = uniqueRecords.filter(r => r.status === 'absent').length;
        const totalOnDuty = uniqueRecords.filter(r => r.status === 'on_duty').length;
        const overallPercentage = totalClasses > 0 ? ((totalPresent + totalOnDuty) / totalClasses) * 100 : 0;

        const newOverallStats = {
          total_classes: totalClasses,
          present_count: totalPresent,
          absent_count: totalAbsent,
          on_duty_count: totalOnDuty,
          percentage: overallPercentage
        };

        console.log('Overall stats:', newOverallStats);
        setOverallStats(newOverallStats);

      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [student]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="h-5 w-5 text-success-500" />;
    if (percentage >= 60) return <Minus className="h-5 w-5 text-warning-500" />;
    return <TrendingDown className="h-5 w-5 text-error-500" />;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success-600';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center h-screen">
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
              <span className="text-xl font-bold text-success-800">Student Portal</span>
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
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Student Info and Date/Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 animate-fade-in col-span-full md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
                <p className="text-lg text-gray-600">Roll Number: {student.roll_number}</p>
                <p className="text-gray-500">Class: {student.class?.name}</p>
              </div>
              <div className="bg-success-100 p-3 rounded-full">
                <User className="h-8 w-8 text-success-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6 animate-fade-in animate-delay-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-success-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-sm font-medium text-gray-900">{currentDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-success-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="text-sm font-medium text-gray-900">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="card p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Overall Attendance</h2>
            {getAttendanceIcon(overallStats.percentage)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            <div className="flex justify-center">
              <AttendanceCircle percentage={overallStats.percentage} size={140} />
            </div>
            
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{overallStats.total_classes}</p>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-semibold text-success-600">{overallStats.present_count}</p>
              </div>
              <div className="text-center p-4 bg-error-50 rounded-lg">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-semibold text-error-600">{overallStats.absent_count}</p>
              </div>
              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <p className="text-sm text-gray-500">On Duty</p>
                <p className="text-2xl font-semibold text-warning-600">{overallStats.on_duty_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="card animate-fade-in">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <BookOpen className="h-5 w-5 text-success-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
            </div>
          ) : subjectAttendance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance records found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {subjectAttendance.map((subject, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-900">{subject.subject_name}</h3>
                      <p className="text-sm text-gray-500">by {subject.faculty_name}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-semibold">{subject.total_classes}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Present</p>
                      <p className="text-lg font-semibold text-success-600">{subject.present_count}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Absent</p>
                      <p className="text-lg font-semibold text-error-600">{subject.absent_count}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getAttendanceIcon(subject.percentage)}
                        <span className={`text-lg font-semibold ${getAttendanceColor(subject.percentage)}`}>
                          {Math.round(subject.percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}