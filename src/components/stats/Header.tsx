import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "./icons/ArrowLeftIcon";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import ViewModeSwitcher from "./ViewModeSwitcher";
import type { ViewMode } from "@/types/stats";

interface HeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
}

const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const currentDay = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diffToSunday = currentDay; // Number of days to subtract to get to Sunday

  const start = new Date(date);
  start.setDate(date.getDate() - diffToSunday);
  start.setHours(0, 0, 0, 0); // Normalize to start of the day

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999); // Normalize to end of the day

  return { start, end };
};

const isSameDate = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const isCurrentWeek = (date: Date, today: Date): boolean => {
  const { start: weekStart } = getWeekRange(date);
  const { start: todayWeekStart } = getWeekRange(today);
  return isSameDate(weekStart, todayWeekStart);
};

const isCurrentMonth = (date: Date, today: Date): boolean =>
  date.getFullYear() === today.getFullYear() &&
  date.getMonth() === today.getMonth();

const isCurrentYear = (date: Date, today: Date): boolean =>
  date.getFullYear() === today.getFullYear();

const formatDateDisplay = (date: Date, viewMode: ViewMode): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today for comparisons

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0); // Normalize current date for comparisons

  const optionsShort: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const optionsMonthYear: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };
  const optionsYearOnly: Intl.DateTimeFormatOptions = { year: "numeric" };
  const optionsFullDateWithYear: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  switch (viewMode) {
    case "day":
      if (isSameDate(normalizedDate, today))
        return `${normalizedDate.toLocaleDateString(
          "en-US",
          optionsShort
        )}, Today`;
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (isSameDate(normalizedDate, yesterday))
        return `${normalizedDate.toLocaleDateString(
          "en-US",
          optionsShort
        )}, Yesterday`;
      return normalizedDate.toLocaleDateString("en-US", optionsShort);

    case "week":
      if (isCurrentWeek(normalizedDate, today)) return "This Week";
      const { start, end } = getWeekRange(normalizedDate);
      const startStr = start.toLocaleDateString(
        "en-US",
        start.getFullYear() === today.getFullYear()
          ? optionsShort
          : optionsFullDateWithYear
      );
      const endStr = end.toLocaleDateString(
        "en-US",
        end.getFullYear() === today.getFullYear()
          ? optionsShort
          : optionsFullDateWithYear
      );

      if (start.getFullYear() !== end.getFullYear()) {
        return `${start.toLocaleDateString(
          "en-US",
          optionsFullDateWithYear
        )} - ${end.toLocaleDateString("en-US", optionsFullDateWithYear)}`;
      }
      return `${startStr} - ${endStr}`;

    case "month":
      if (isCurrentMonth(normalizedDate, today)) return "This Month";
      return normalizedDate.toLocaleDateString("en-US", optionsMonthYear);

    case "year":
      if (isCurrentYear(normalizedDate, today)) return "This Year";
      return normalizedDate.toLocaleDateString("en-US", optionsYearOnly);

    default: // Should not happen
      return normalizedDate.toLocaleDateString("en-US", optionsShort);
  }
};

const Header: React.FC<HeaderProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevPeriod,
  onNextPeriod,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/home");
  };

  return (
    <header className="flex flex-col items-center text-slate-300 space-y-4 sm:space-y-6">
      {/* Top section: Back button and ViewModeSwitcher */}
      <div className="w-full relative flex items-center justify-center h-10">
        <button
          onClick={handleBackClick}
          aria-label="Go back to home"
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:text-white transition-colors rounded-full hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        <ViewModeSwitcher
          currentViewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>

      {/* Date navigation section */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onPrevPeriod}
          aria-label={`Previous ${viewMode}`}
          className="p-2 hover:text-white transition-colors rounded-full hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-white select-none text-center min-w-[140px] sm:min-w-[160px] tabular-nums">
          {formatDateDisplay(currentDate, viewMode)}
        </span>
        <button
          onClick={onNextPeriod}
          aria-label={`Next ${viewMode}`}
          className="p-2 hover:text-white transition-colors rounded-full hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
