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

  // Calculate date boundaries (yesterday to tomorrow)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);

  const isToday = selectedDateNormalized.getTime() === today.getTime();
  const isYesterday = selectedDateNormalized.getTime() === yesterday.getTime();
  const isTomorrow = selectedDateNormalized.getTime() === tomorrow.getTime();

  // Disable navigation at boundaries
  const canGoPrevious = !isYesterday;
  const canGoNext = !isTomorrow;

  const goToPreviousDay = () => {
    if (!canGoPrevious) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    if (!canGoNext) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date: Date) => {
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    if (isTomorrow) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatSubtext = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        disabled={!canGoPrevious}
        className={`flex items-center gap-1 sm:gap-2 ${!canGoPrevious ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="text-center min-w-[140px] sm:min-w-[200px]">
        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          {formatDate(selectedDate)}
        </p>
        {(isYesterday || isTomorrow) && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatSubtext(selectedDate)}
          </p>
        )}
        {!isToday && (
          <button
            onClick={goToToday}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Jump to Today
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextDay}
        disabled={!canGoNext}
        className={`flex items-center gap-1 sm:gap-2 ${!canGoNext ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
