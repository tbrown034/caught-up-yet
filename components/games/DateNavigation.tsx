"use client";

import Button from "@/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateNavigation({
  selectedDate,
  onDateChange,
}: DateNavigationProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday =
    selectedDate.toDateString() === today.toDateString();

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        className="flex items-center gap-2"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Previous
      </Button>

      <div className="text-center min-w-[200px]">
        <p className="text-lg font-semibold text-gray-900">
          {formatDate(selectedDate)}
        </p>
        {!isToday && (
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Jump to Today
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextDay}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
