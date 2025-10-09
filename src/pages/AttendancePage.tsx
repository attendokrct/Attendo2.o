import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'on_duty';
}

export default function AttendancePage() {
  const { periodId, classCode } = useParams<{ periodId: string; classCode: string }>();
  const navigate = useNavigate();
  const { faculty } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'on_duty'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [periodInfo, setPeriodInfo] = useState<any>(null);

  useEffect(() => {
    if (periodId && classCode) {
      fetchPeriodInfo();
      fetchStudents();
    }
  }, [periodId, classCode]);

  const fetchPeriodInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('id', periodId)
        .maybeSingle();

      if (error) throw error;
      setPeriodInfo(data);
    } catch (error) {
      console.error('Error fetching period info:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      
      // Get class ID from class code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('code', classCode)
        .maybeSingle();

      if (classError) throw classError;

      // Get students for this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, roll_number, name')
        .eq('class_id', classData.id)
        .order('roll_number');

      if (studentsError) throw studentsError;

      setStudents(studentsData || []);

      // Get existing attendance for today
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .eq('period_id', periodId)
        .eq('date', today);

      if (attendanceError) throw attendanceError;

      // Set existing attendance
      const attendanceMap: Record<string, 'present' | 'absent' | 'on_duty'> = {};
      attendanceData?.forEach((record: AttendanceRecord) => {
        attendanceMap[record.student_id] = record.status;
      });
      setAttendance(attendanceMap);

    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'on_duty') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      setIsSaving(true);
      const today = new Date().toISOString().split('T')[0];

      // Prepare attendance records
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        period_id: periodId,
        student_id: studentId,
        date: today,
        status
      }));

      // Upsert attendance records
      const { error } = await supabase
        .from('attendance_records')
        .upsert(attendanceRecords, {
          onConflict: 'period_id,student_id,date'
        });

      if (error) throw error;

      alert('Attendance saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const onDuty = Object.values(attendance).filter(status => status === 'on_duty').length;
    
    return { total, present, absent, onDuty };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Take Attendance</h1>
            <p className="text-gray-600">
              {periodInfo?.name} - {classCode} - {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Present</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">On Duty</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.onDuty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Student Attendance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On Duty
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.roll_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'present'}
                      onChange={() => handleAttendanceChange(student.id, 'present')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'absent'}
                      onChange={() => handleAttendanceChange(student.id, 'absent')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'on_duty'}
                      onChange={() => handleAttendanceChange(student.id, 'on_duty')}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveAttendance}
          disabled={isSaving}
          className="btn btn-primary px-8 py-3"
        >
          {isSaving ? (
            <span className="flex items-center">
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </span>
          ) : (
            'Save Attendance'
          )}
        </button>
      </div>
    </div>
  );
}