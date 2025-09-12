import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, BookOpen, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Class {
  id: string;
  code: string;
  name: string;
}

interface Period {
  id: string;
  name: string;
  time_slot: string;
  weekday: string;
  classId: string;
  className: string;
  classCode: string;
}

export default function DashboardPage() {
  const { faculty } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Period[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!faculty) return;

      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('code');

        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [faculty]);

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

  const handleClassClick = async (classItem: Class) => {
    if (!faculty) return;

    try {
      // Get current weekday
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentWeekday = weekdays[new Date().getDay()];
      
      // Create a new period record in the database
      const { data: newPeriod, error } = await supabase
        .from('periods')
        .insert({
          faculty_id: faculty.id,
          class_id: classItem.id,
          name: classItem.name,
          time_slot: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          weekday: currentWeekday
        })
        .select()
        .single();

      if (error) throw error;

      // Add to today's schedule
      if (newPeriod) {
        const periodWithClassInfo = {
          ...newPeriod,
          classId: classItem.id,
          className: classItem.name,
          classCode: classItem.code
        };
        setTodaySchedule(prev => [...prev, periodWithClassInfo]);
      }
    } catch (error) {
      console.error('Error creating period:', error);
    }
  };

  const handleScheduleClick = (scheduleItem: Period) => {
    navigate(`/attendance/${scheduleItem.id}/${scheduleItem.classCode}`);
  };

  const handleRemovePeriod = async (period: Period) => {
    try {
      // Delete the period from the database
      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('id', period.id);

      if (error) throw error;

      // Remove from today's schedule
      setTodaySchedule(prev => prev.filter(item => item.id !== period.id));
    } catch (error) {
      console.error('Error removing period:', error);
    }
  };

  if (!faculty) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 animate-fade-in col-span-full md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{faculty.name}</h1>
              <p className="text-lg text-gray-600">{faculty.designation}</p>
              <p className="text-gray-500">{faculty.department}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <User className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in animate-delay-100 col-span-full md:col-span-1">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-medium text-gray-900">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Time</p>
              <p className="text-lg font-medium text-gray-900">{currentTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Faculty Classes</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Classes */}
          <div className="card">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">Available Classes</h3>
              <p className="text-sm text-gray-500">Click to add to today's schedule</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                {classes.map((classItem, index) => (
                  <div
                    key={classItem.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 cursor-pointer transition-all animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleClassClick(classItem)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                        <p className="text-sm text-gray-500">Code: {classItem.code}</p>
                      </div>
                      <Plus className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="card">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">Today's Schedule</h3>
              <p className="text-sm text-gray-500">Click to take attendance</p>
            </div>
            <div className="p-4">
              {todaySchedule.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No classes scheduled for today.<br />
                  Click on classes from the left to add them.
                </p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((scheduleItem, index) => (
                    <div
                      key={scheduleItem.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-success-50 hover:border-success-300 cursor-pointer transition-all animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleScheduleClick(scheduleItem)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{scheduleItem.className}</h4>
                          <p className="text-sm text-gray-500">Code: {scheduleItem.classCode}</p>
                          <p className="text-sm text-primary-600 font-medium">
                            Time: {scheduleItem.time_slot}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePeriod(scheduleItem);
                          }}
                          className="p-1 text-error-600 hover:text-error-800 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && classes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No classes available.</p>
        </div>
      )}
    </div>
  );
}