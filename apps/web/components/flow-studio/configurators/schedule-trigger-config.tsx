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

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

// Common timezones with offsets
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time) +00:00" },
  { value: "America/New_York", label: "America/New_York (Eastern Time) -05:00" },
  { value: "America/Chicago", label: "America/Chicago (Central Time) -06:00" },
  { value: "America/Denver", label: "America/Denver (Mountain Time) -07:00" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time) -08:00" },
  { value: "America/Anchorage", label: "America/Anchorage (Alaska Time) -09:00" },
  { value: "America/Honolulu", label: "America/Honolulu (Hawaii Time) -10:00" },
];

export function ScheduleTriggerConfig({ data, onUpdate }: ScheduleTriggerConfigProps) {
  const [frequency, setFrequency] = useState(data.frequency || 'day');
  const [interval, setInterval] = useState(data.interval || 1);
  const [time, setTime] = useState(data.time || '09:00');
  const [weekdays, setWeekdays] = useState<string[]>(data.weekdays || ['1']);
  const [dayOfMonth, setDayOfMonth] = useState(data.dayOfMonth || 1);
  const [timezone, setTimezone] = useState(data.timezone || 'UTC');
  const [cronExpression, setCronExpression] = useState(data.cronExpression || '* * * * *');
  const [open, setOpen] = useState(false);

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {timezone
                  ? TIMEZONES.find((t) => t.value === timezone)?.label
                  : "Select timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {TIMEZONES.map((t) => (
                      <CommandItem
                        key={t.value}
                        value={t.label}
                        onSelect={() => {
                          setTimezone(t.value === timezone ? "" : t.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            timezone === t.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
