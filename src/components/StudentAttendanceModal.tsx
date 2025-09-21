import React from 'react';
import { X } from 'lucide-react';
import AttendanceCircle from './AttendanceCircle';
import { AttendanceStats } from '../stores/attendanceStore';

interface StudentAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  stats: AttendanceStats;
}

export default function StudentAttendanceModal({
  isOpen,
  onClose,
  studentName,
  stats
}: StudentAttendanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Attendance Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{studentName}</p>
        </div>

        <div className="flex justify-center mb-8">
          <AttendanceCircle percentage={stats.percentage} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Classes</p>
            <p className="text-xl font-semibold text-gray-900">
              {stats.total_classes}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Present</p>
            <p className="text-xl font-semibold text-gray-900">
              {stats.present_count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}