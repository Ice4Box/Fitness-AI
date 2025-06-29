import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Dumbbell, Droplets, Weight, Bot, Clock, Trophy } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

// Mock user ID - in real app, this would come from auth context
const MOCK_USER_ID = 1;

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/dashboard/stats/${MOCK_USER_ID}`],
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 pb-20 md:pt-20 md:pb-0">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-2xl w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const todayCalories = stats?.todayCalories || 0;
  const calorieTarget = 2200;
  const calorieProgress = (todayCalories / calorieTarget) * 100;

  return (
    <div className="min-h-screen p-6 md:p-8 pb-20 md:pt-20 md:pb-0 space-y-6">
      {/* Modern Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏋️‍♂️</span>
            <span className="text-sm text-gray-500 font-medium">Hello,</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Benjamin</h1>
        </div>
        <div className="profile-avatar">
          B
        </div>
      </div>

      {/* Weekly Stats Card - Inspired by the design */}
      <div className="fitness-card p-6 space-y-4">
        <h3 className="text-fitness-subheading">Weekly stats</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Calories Card */}
          <div className="stat-card space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 text-sm font-medium">{todayCalories}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{todayCalories.toLocaleString()}</div>
            <div className="text-xs text-gray-500">kcal burnt</div>
          </div>

          {/* Exercises Card */}
          <div className="stat-card space-y-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              <span className="text-blue-500 text-sm font-medium">{stats?.weekWorkoutCount || 0}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.weekWorkoutCount || 107}</div>
            <div className="text-xs text-gray-500">exercises</div>
          </div>
        </div>

        {/* Active Days */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Most active</span>
            <span className="text-sm font-medium text-gray-900">Thursday</span>
          </div>
          <div className="flex gap-1">
            {['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'].map((day, index) => (
              <div key={day} className="flex-1 text-center">
                <div className={`text-xs text-gray-500 mb-1`}>{day}</div>
                <div className={`h-8 rounded-lg ${index === 3 ? 'bg-blue-500' : 'bg-gray-100'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Celebrity Programs Card */}
        <div className="fitness-card p-6 gradient-bg-blue text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Try celebrity training programs!</h3>
            <div className="flex justify-between items-end mt-6">
              <div className="space-y-2">
                <Button className="btn-fitness-secondary text-blue-600 hover:text-blue-700">
                  Skip
                </Button>
                <Button className="btn-fitness-primary bg-white text-blue-600 hover:bg-gray-50">
                  Let's try
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        </div>

        {/* BMI & Goals Card */}
        <div className="fitness-card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-fitness-subheading">Body Metrics</h3>
              <p className="text-sm text-gray-500 mt-1">BMI & Daily Targets</p>
            </div>
            <Button size="sm" variant="ghost" className="text-blue-500">
              View
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">BMI</span>
              <span className="text-sm font-semibold text-gray-900">22.4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Calories</span>
              <span className="text-sm font-semibold text-gray-900">{calorieTarget}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Protein Target</span>
              <span className="text-sm font-semibold text-gray-900">150g</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Today's Progress</span>
              <span className="text-xs text-gray-500">{Math.round(calorieProgress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="fitness-card p-4 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <Bot className="w-6 h-6 text-blue-500" />
          <span className="text-sm font-medium">AI Workout</span>
        </Button>
        
        <Button className="fitness-card p-4 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-sm font-medium">Log Meal</span>
        </Button>
        
        <Button className="fitness-card p-4 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <Weight className="w-6 h-6 text-green-500" />
          <span className="text-sm font-medium">Track Weight</span>
        </Button>
        
        <Button className="fitness-card p-4 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <Trophy className="w-6 h-6 text-purple-500" />
          <span className="text-sm font-medium">Goals</span>
        </Button>
      </div>
    </div>
  );
}
