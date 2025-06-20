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

export default function TestPage() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent("Feedback về ứng dụng");
    const body = encodeURIComponent(
      "Xin chào,\n\nTôi muốn gửi feedback về ứng dụng...\n\nTrân trọng,"
    );
    window.open(
      `mailto:test@email.com?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Context Menu Test Page
        </h1>
        <p className="text-blue-200 mb-8">
          Right-click on the area below to open context menu
        </p>

        <ContextMenu>
          <ContextMenuTrigger className="block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 cursor-pointer min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Context Menu Area
              </h2>
              <p className="text-blue-200 text-lg">Right-click to see menu</p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-blue-300">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Timer</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Stats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-56">
            <ContextMenuItem
              onClick={() => handleNavigation("/home")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => handleNavigation("/time")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Timer</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => handleNavigation("/stats")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => handleNavigation("/configure-tasks")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={handleSendFeedback}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Send Feedback</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <div className="mt-8 text-blue-200 text-sm">
          <p>Or use shortcuts:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={() => handleNavigation("/home")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => handleNavigation("/time")}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Go to Timer
            </button>
            <button
              onClick={() => handleNavigation("/stats")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Go to Stats
            </button>
            <button
              onClick={() => handleNavigation("/configure-tasks")}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
