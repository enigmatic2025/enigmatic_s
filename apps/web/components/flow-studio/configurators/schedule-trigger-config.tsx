import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ScheduleTriggerConfigProps {
  data: any;
  onUpdate: (data: any) => void;
}

const FREQUENCIES = [
  { value: 'minute', label: 'Minutes' },
  { value: 'hour', label: 'Hours' },
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'cron', label: 'Custom Cron' },
];

const WEEKDAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function ScheduleTriggerConfig({ data, onUpdate }: ScheduleTriggerConfigProps) {
  const [frequency, setFrequency] = useState(data.frequency || 'day');
  const [interval, setInterval] = useState(data.interval || 1);
  const [time, setTime] = useState(data.time || '09:00');
  const [weekdays, setWeekdays] = useState<string[]>(data.weekdays || ['1']);
  const [dayOfMonth, setDayOfMonth] = useState(data.dayOfMonth || 1);
  const [timezone, setTimezone] = useState(data.timezone || 'UTC');
  const [cronExpression, setCronExpression] = useState(data.cronExpression || '* * * * *');

  // Update parent when local state changes
  useEffect(() => {
    let description = '';
    
    switch (frequency) {
      case 'minute':
        description = `Runs every ${interval} minute${interval > 1 ? 's' : ''}`;
        break;
      case 'hour':
        description = `Runs every ${interval} hour${interval > 1 ? 's' : ''}`;
        break;
      case 'day':
        description = `Runs daily at ${time} (${timezone})`;
        break;
      case 'week':
        const days = weekdays.map(d => WEEKDAYS.find(w => w.value === d)?.label).join(', ');
        description = `Runs weekly on ${days} at ${time} (${timezone})`;
        break;
      case 'month':
        description = `Runs monthly on day ${dayOfMonth} at ${time} (${timezone})`;
        break;
      case 'cron':
        description = `Runs on cron: ${cronExpression}`;
        break;
    }

    onUpdate({
      frequency,
      interval,
      time,
      weekdays,
      dayOfMonth,
      timezone,
      cronExpression,
      description
    });
  }, [frequency, interval, time, weekdays, dayOfMonth, timezone, cronExpression]);

  const toggleWeekday = (value: string) => {
    setWeekdays(prev => 
      prev.includes(value) 
        ? prev.filter(d => d !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Run Frequency</Label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(frequency === 'minute' || frequency === 'hour') && (
        <div className="space-y-2">
          <Label>Interval (every x {frequency}s)</Label>
          <Input 
            type="number" 
            min={1} 
            value={interval} 
            onChange={e => setInterval(parseInt(e.target.value) || 1)} 
          />
        </div>
      )}

      {(frequency === 'day' || frequency === 'week' || frequency === 'month') && (
        <div className="space-y-2">
          <Label>Time</Label>
          <Input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)} 
          />
        </div>
      )}

      {frequency === 'week' && (
        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="grid grid-cols-2 gap-2">
            {WEEKDAYS.map(day => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`day-${day.value}`} 
                  checked={weekdays.includes(day.value)}
                  onCheckedChange={() => toggleWeekday(day.value)}
                />
                <label 
                  htmlFor={`day-${day.value}`} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {frequency === 'month' && (
        <div className="space-y-2">
          <Label>Day of Month</Label>
          <Input 
            type="number" 
            min={1} 
            max={31} 
            value={dayOfMonth} 
            onChange={e => setDayOfMonth(parseInt(e.target.value) || 1)} 
          />
        </div>
      )}

      {frequency === 'cron' && (
        <div className="space-y-2">
          <Label>Cron Expression</Label>
          <Input 
            value={cronExpression} 
            onChange={e => setCronExpression(e.target.value)} 
            placeholder="* * * * *"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Format: minute hour day(month) month day(week)
          </p>
        </div>
      )}

      {frequency !== 'cron' && (
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
