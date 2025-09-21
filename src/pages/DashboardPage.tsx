import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, BookOpen, Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Period {
  id: string;
  name: string;
  time_slot: string;
  weekday: string;
  class: {
    id: string;
    code: string;
    name: string;
  };
}

interface Class {
  id: string;
  code: string;
  name: string;
}

export default function DashboardPage() {
  const { faculty } = useAuthStore();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Period[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setSelectedWeekday(weekdays[now.getDay()]);
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!faculty || !selectedWeekday) return;

      try {
        // Fetch all classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .order('code');

        if (classesData) {
          setClasses(classesData);
        }

        const { data, error } = await supabase
          .from('periods')
          .select(`
            id,
            name,
            time_slot,
            weekday,
            class:classes (
              id,
              code,
              name
            )
          `)
          .eq('faculty_id', faculty.id)
          .eq('weekday', selectedWeekday)
          .order('time_slot');

        if (error) throw error;
        setTimetable(data || []);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [faculty, selectedWeekday]);

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

  const handlePeriodClick = (period: Period) => {
    navigate(`/attendance/${period.id}/${period.class.code}`);
  };

  const handleAddPeriod = async () => {
    if (!faculty || !selectedClass || !selectedWeekday) return;
    
    setIsAddingPeriod(true);
    
    try {
      const selectedClassData = classes.find(c => c.id === selectedClass);
      if (!selectedClassData) return;
      
      const periodCount = timetable.length + 1;
      const timeSlots = [
        '8:45 AM - 9:45 AM',
        '9:45 AM - 10:45 AM', 
        '11:00 AM - 12:00 PM',
        '1:00 PM - 2:00 PM',
        '2:00 PM - 2:50 PM',
        '3:05 PM - 4:00 PM',
        '4:00 PM - 4:45 PM'
      ];
      
      const { data, error } = await supabase
        .from('periods')
        .insert({
          faculty_id: faculty.id,
          class_id: selectedClass,
          name: `Period ${periodCount}`,
          time_slot: timeSlots[Math.min(periodCount - 1, timeSlots.length - 1)],
          weekday: selectedWeekday
        })
        .select(`
          id,
          name,
          time_slot,
          weekday,
          class:classes (
            id,
            code,
            name
          )
        `)
        .single();

      if (error) throw error;
      
      if (data) {
        setTimetable(prev => [...prev, data]);
        setSelectedClass('');
      }
    } catch (error) {
      console.error('Error adding period:', error);
    } finally {
      setIsAddingPeriod(false);
    }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Timetable</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedWeekday}
            onChange={(e) => setSelectedWeekday(e.target.value)}
            className="form-input py-1 pl-3 pr-8"
          >
            {weekdays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input py-1 pl-3 pr-8"
              disabled={isAddingPeriod}
            >
              <option value="">Select a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddPeriod}
              disabled={!selectedClass || isAddingPeriod}
              className="btn btn-primary flex items-center"
            >
              {isAddingPeriod ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Adding...
                </span>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Period
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetable.map((period, index) => (
            <div
              key={period.id}
              className="card hover:shadow-md transition-all cursor-pointer animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handlePeriodClick(period)}
            >
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-800">{period.name}</h3>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {period.time_slot}
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {period.class.name}
                    </h4>
                    <p className="text-sm text-gray-500">Class Code: {period.class.code}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && timetable.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No classes scheduled for {selectedWeekday}.</p>
        </div>
      )}
    </div>
  );
}