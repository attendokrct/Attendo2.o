import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Class {
  id: string;
  code: string;
  name: string;
}

interface Period {
  id?: string;
  name: string;
  time_slot: string;
  weekday: string;
  class_id: string;
}

export default function TimetableEditPage() {
  const { faculty } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetable, setTimetable] = useState<Record<string, Period[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWeekday, setSelectedWeekday] = useState('Monday');

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:45:00 AM - 9:45 AM',
    '9:45 AM - 10:45 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 2:50 PM',
    '3:05 PM - 4:00 PM',
    '4:00 PM - 4:45 PM'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!faculty) return;

      try {
        // Fetch all classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .order('code');

        if (classesData) {
          setClasses(classesData);
        }

        // Initialize empty timetable for all weekdays
        const emptyTimetable: Record<string, Period[]> = {};
        weekdays.forEach(day => {
          emptyTimetable[day] = [];
        });

        // Fetch existing timetable
        const { data: periodsData } = await supabase
          .from('periods')
          .select('*')
          .eq('faculty_id', faculty.id);

        // Organize periods by weekday
        if (periodsData) {
          periodsData.forEach(period => {
            const weekday = period.weekday || 'Monday';
            if (!emptyTimetable[weekday]) {
              emptyTimetable[weekday] = [];
            }
            emptyTimetable[weekday].push(period);
          });
        }

        setTimetable(emptyTimetable);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [faculty]);

  const handleAddPeriod = (weekday: string) => {
    setTimetable(prev => ({
      ...prev,
      [weekday]: [
        ...prev[weekday],
        {
          id: crypto.randomUUID(), // Generate a unique ID for each new period
          name: `Period ${prev[weekday].length + 1}`,
          time_slot: timeSlots[0],
          weekday,
          class_id: classes[0]?.id || ''
        }
      ]
    }));
  };

  const handleRemovePeriod = (weekday: string, index: number) => {
    setTimetable(prev => ({
      ...prev,
      [weekday]: prev[weekday].filter((_, i) => i !== index)
    }));
  };

  const handlePeriodChange = (weekday: string, index: number, field: keyof Period, value: string) => {
    setTimetable(prev => ({
      ...prev,
      [weekday]: prev[weekday].map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }));
  };

  const handleSave = async () => {
    if (!faculty) return;
    setIsSaving(true);

    try {
      // Delete existing periods for all weekdays
      await supabase
        .from('periods')
        .delete()
        .eq('faculty_id', faculty.id);

      // Insert new periods for all weekdays
      const allPeriods = Object.entries(timetable).flatMap(([weekday, periods]) =>
        periods.map(period => ({
          ...period,
          faculty_id: faculty.id,
          weekday
        }))
      );

      if (allPeriods.length === 0) {
        navigate('/dashboard');
        return;
      }

      const { error } = await supabase
        .from('periods')
        .insert(allPeriods);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving timetable:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex items-center"
        >
          {isSaving ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Timetable
            </>
          )}
        </button>
      </div>

      <div className="mb-6">
        <select
          value={selectedWeekday}
          onChange={(e) => setSelectedWeekday(e.target.value)}
          className="form-input w-48"
        >
          {weekdays.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{selectedWeekday}</h2>
          <button
            onClick={() => handleAddPeriod(selectedWeekday)}
            className="btn btn-secondary flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Period
          </button>
        </div>
        <div className="p-4">
          {timetable[selectedWeekday]?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No periods scheduled for {selectedWeekday}
            </p>
          ) : (
            <div className="space-y-4">
              {timetable[selectedWeekday]?.map((period, index) => (
                <div key={period.id} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="form-label">Period Name</label>
                    <input
                      type="text"
                      value={period.name}
                      onChange={(e) => handlePeriodChange(selectedWeekday, index, 'name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="form-label">Time Slot</label>
                    <select
                      value={period.time_slot}
                      onChange={(e) => handlePeriodChange(selectedWeekday, index, 'time_slot', e.target.value)}
                      className="form-input"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="form-label">Class</label>
                    <select
                      value={period.class_id}
                      onChange={(e) => handlePeriodChange(selectedWeekday, index, 'class_id', e.target.value)}
                      className="form-input"
                    >
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-7">
                    <button
                      onClick={() => handleRemovePeriod(selectedWeekday, index)}
                      className="p-2 text-error-600 hover:text-error-800 rounded-full hover:bg-error-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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