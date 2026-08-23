"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  PieChart,
  UserCircle,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", icon: MessageCircle, label: "Chat" },
  { href: "/portfolio", icon: PieChart, label: "Portfolio" },
  { href: "/profile", icon: UserCircle, label: "Profilo" },
  { href: "/settings", icon: Settings, label: "Impostazioni" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
