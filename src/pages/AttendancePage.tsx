import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Save, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore, Student, AttendanceStats } from '../stores/attendanceStore';
import StudentAttendanceModal from '../components/StudentAttendanceModal';

export default function AttendancePage() {
  const { periodId, classCode } = useParams<{ periodId: string; classCode: string }>();
  const { faculty } = useAuthStore();
  const { 
    records, 
    initializeAttendance, 
    markAttendance, 
    submitAttendance, 
    isLoading,
    isSubmitted,
    fetchStudentsByClass,
    getStudentStats,
    getClassId 
  } = useAttendanceStore();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({ present: 0, absent: 0, onDuty: 0, total: 0 });
  const [selectedStudent, setSelectedStudent] = useState<{
    name: string;
    stats: AttendanceStats;
  } | null>(null);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!faculty || !periodId || !classCode) return;

    const loadData = async () => {
      const classId = await getClassId(classCode);
      if (!classId) {
        console.error('Class not found');
        return;
      }
      await initializeAttendance(periodId, classId);
      const students = await fetchStudentsByClass(classCode);
      setStudents(students);
    };

    loadData();
  }, [faculty, periodId, classCode, initializeAttendance, fetchStudentsByClass, getClassId]);

  useEffect(() => {
    if (records) {
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const onDutyCount = records.filter(r => r.status === 'on_duty').length;
      setStats({
        present: presentCount,
        absent: absentCount,
        onDuty: onDutyCount,
        total: records.length
      });
    }
  }, [records]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (isSubmitted) return;
    
    if (status === 'absent') {
      setSelectedStudentId(studentId);
      setShowAbsentModal(true);
    } else {
      await markAttendance(studentId, status);
    }
  };

  const handleAbsentTypeSelect = async (type: 'absent' | 'on_duty') => {
    if (selectedStudentId) {
      await markAttendance(selectedStudentId, type);
      setSelectedStudentId(null);
    }
    setShowAbsentModal(false);
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    const success = await submitAttendance();
    if (success) {
      setSuccessMessage('Attendance submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleViewStats = async (student: Student) => {
    if (!faculty) return;
    const stats = await getStudentStats(student.id, faculty.id);
    setSelectedStudent({ name: student.name, stats });
  };

  const getStudentStatus = (studentId: string): 'present' | 'absent' | 'on_duty' => {
    const record = records.find(r => r.student_id === studentId);
    return record?.status || 'present';
  };

  const getStatusColor = (status: 'present' | 'absent' | 'on_duty') => {
    switch (status) {
      case 'present':
        return 'bg-success-500 text-white';
      case 'absent':
        return 'bg-error-500 text-white';
      case 'on_duty':
        return 'bg-warning-500 text-white';
      default:
        return 'bg-gray-100 text-gray-500 hover:bg-gray-200';
    }
  };

  return (
    <>
      <div className="flex items-center text-warning-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Attendance already submitted for today</span>
      </div>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        {isSubmitted ? (
          <div className="flex items-center text-warning-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Attendance already submitted for today</span>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitted}
            className={`btn ${isSubmitted ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'} flex items-center`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </>
            )}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Attendance Sheet</h1>
              <p className="text-sm text-gray-500">Class: {classCode}</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="p-2 bg-success-50 rounded-full mr-2">
                  <Check className="h-5 w-5 text-success-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Present</p>
                  <p className="text-lg font-semibold">{stats.present}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-error-50 rounded-full mr-2">
                  <X className="h-5 w-5 text-error-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Absent</p>
                  <p className="text-lg font-semibold">{stats.absent}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-warning-50 rounded-full mr-2">
                  <Clock className="h-5 w-5 text-warning-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">On Duty</p>
                  <p className="text-lg font-semibold">{stats.onDuty}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-full mr-2">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {students.map((student, index) => (
            <div key={student.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-1 text-gray-500">{index + 1}</div>
                <div className="col-span-3 font-medium">{student.roll_number}</div>
                <div className="col-span-4">{student.name}</div>
                <div className="col-span-3 flex justify-center space-x-2">
                  <button
                    onClick={() => handleMarkAttendance(student.id, 'present')}
                    disabled={isSubmitted}
                    className={`p-2 rounded-full transition-colors ${
                      getStudentStatus(student.id) === 'present'
                        ? getStatusColor('present')
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleMarkAttendance(student.id, 'absent')}
                    disabled={isSubmitted}
                    className={`p-2 rounded-full transition-colors ${
                      getStudentStatus(student.id) === 'absent' || getStudentStatus(student.id) === 'on_duty'
                        ? getStatusColor(getStudentStatus(student.id))
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getStudentStatus(student.id) === 'on_duty' ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => handleViewStats(student)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    Stats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <StudentAttendanceModal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          studentName={selectedStudent.name}
          stats={selectedStudent.stats}
        />
      )}

      {showAbsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Absence Type</h3>
            <div className="space-y-4">
              <button
                onClick={() => handleAbsentTypeSelect('absent')}
                className="w-full btn bg-error-500 text-white hover:bg-error-600"
              >
                Absent
              </button>
              <button
                onClick={() => handleAbsentTypeSelect('on_duty')}
                className="w-full btn bg-warning-500 text-white hover:bg-warning-600"
              >
                On Duty
              </button>
              <button
                onClick={() => setShowAbsentModal(false)}
                className="w-full btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}