"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  Music,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Sessions", href: "/dashboard/sessions", icon: Activity },
  { name: "Music Library", href: "/dashboard/music", icon: Music },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "IoT Monitor", href: "/dashboard/iot-monitor", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Floating Toggle Button - Above everything */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-20 transition-all duration-300 h-8 w-8 rounded-full border-2 border-primary bg-white dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary shadow-xl z-[100] flex items-center justify-center ${
          isCollapsed ? "left-16" : "left-60"
        }`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <aside
        className={`hidden lg:flex lg:flex-col flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Pacebeats Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl flex-shrink-0"
            />
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pacebeats
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <TooltipProvider>
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const navLink = (
                <Link key={item.href} href={item.href} className="block">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </motion.div>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navLink;
            })}
          </TooltipProvider>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Need Help?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Check our documentation or contact support
              </p>
              <Link
                href="/dashboard/help"
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Learn More →
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
