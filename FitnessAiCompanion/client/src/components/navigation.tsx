import { Link, useLocation } from "wouter";
import { BarChart3, Dumbbell, Utensils, Trophy } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/nutrition", icon: Utensils, label: "Nutrition" },
    { path: "/progress", icon: Trophy, label: "Progress" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="flex justify-around items-center py-2 md:justify-center md:space-x-8 md:py-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center p-2 md:flex-row md:space-x-2 ${
              location === path
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <Icon className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
