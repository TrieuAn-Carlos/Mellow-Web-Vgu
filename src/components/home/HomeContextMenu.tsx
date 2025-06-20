"use client";

import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Home, Clock, BarChart3, Settings, Mail } from "lucide-react";

interface HomeContextMenuProps {
  children: React.ReactNode;
}

/**
 * HomeContextMenu component that wraps any content with a right-click context menu
 * specifically designed for the home page (Home menu item is disabled)
 */
export function HomeContextMenu({ children }: HomeContextMenuProps) {
  const router = useRouter();

  /**
   * Handle navigation to different pages
   * @param path - The route path to navigate to
   */
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  /**
   * Open email client with pre-filled feedback template
   * Creates a mailto link with subject and body content
   */
  const handleSendFeedback = () => {
    const subject = encodeURIComponent("App Feedback");
    const body = encodeURIComponent(
      "Hello,\n\nI would like to send feedback about the app...\n\nBest regards,"
    );
    window.open(
      `mailto:test@email.com?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  return (
    <ContextMenu>
      {/* Trigger area - wraps the entire children content */}
      <ContextMenuTrigger className="block">{children}</ContextMenuTrigger>

      {/* Context menu content with dark theme styling */}
      <ContextMenuContent className="w-56">
        {/* Navigation Section */}
        {/* Home item - disabled since we're already on home page */}
        <ContextMenuItem
          disabled
          className="flex items-center gap-2 cursor-not-allowed opacity-50"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Task Management Section */}
        {/* Timer page - for time tracking */}
        <ContextMenuItem
          onClick={() => handleNavigation("/time")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Timer</span>
        </ContextMenuItem>

        {/* Stats page - for viewing analytics */}
        <ContextMenuItem
          onClick={() => handleNavigation("/stats")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Stats</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Configuration Section */}
        {/* Settings page - for task configuration */}
        <ContextMenuItem
          onClick={() => handleNavigation("/configure-tasks")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Support Section */}
        {/* Send feedback via email */}
        <ContextMenuItem
          onClick={handleSendFeedback}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>Send Feedback</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
