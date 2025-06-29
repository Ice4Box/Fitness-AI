import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Trophy, TrendingUp, TrendingDown, CheckCircle, X } from "lucide-react";

// Mock user ID - in real app, this would come from auth context
const MOCK_USER_ID = 1;

export default function Progress() {
  const { data: progressEntries, isLoading } = useQuery({
    queryKey: [`/api/progress/user/${MOCK_USER_ID}`],
  });

  const mockWeekData = [
    { day: "Mon", completed: true },
    { day: "Tue", completed: true },
    { day: "Wed", completed: false },
    { day: "Thu", completed: true },
    { day: "Fri", completed: true },
    { day: "Sat", completed: true },
    { day: "Sun", completed: false },
  ];

  const achievements = [
    {
      title: "10 Day Streak!",
      description: "Completed 10 consecutive workout days",
      date: "2 days ago",
      icon: Trophy,
      gradient: "from-yellow-50 to-orange-50",
      iconBg: "bg-yellow-500",
    },
    {
      title: "Weight Goal Achieved!",
      description: "Lost 2.5kg this month",
      date: "5 days ago",
      icon: TrendingDown,
      gradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-500",
    },
    {
      title: "Strength Milestone!",
      description: "Bench pressed 70kg for the first time",
      date: "1 week ago",
      icon: TrendingUp,
      gradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 pb-20 md:pt-20 md:pb-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-48 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pt-20 md:pb-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-dark">Progress Tracking</h2>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <LineChart className="w-4 h-4 mr-2" />
          View Report
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-dark mb-4">Weight Progress</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-dark">72.5 kg</p>
                <p className="text-sm text-gray-600">Current Weight</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-500">-2.5 kg</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
            {/* Mock chart placeholder */}
            <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Weight Chart Visualization</span>
            </div>
          </CardContent>
        </Card>

        {/* Body Fat Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-dark mb-4">Body Fat %</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-dark">15.2%</p>
                <p className="text-sm text-gray-600">Current Body Fat</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-500">-1.8%</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
            {/* Mock chart placeholder */}
            <div className="h-32 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Body Fat Chart Visualization</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout Streak */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-dark mb-6">Workout Streak</h3>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                12
              </p>
              <p className="text-gray-600">Days Current Streak</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-dark">28</p>
              <p className="text-gray-600">Longest Streak</p>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="grid grid-cols-7 gap-2">
            {mockWeekData.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500 mb-2">{day.day}</p>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    day.completed
                      ? "bg-green-500"
                      : index === 5
                      ? "bg-primary animate-pulse"
                      : "bg-gray-200"
                  }`}
                >
                  {day.completed ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : index === 5 ? (
                    <span className="text-white text-xs font-bold">?</span>
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-dark mb-6">Recent Achievements</h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center p-4 bg-gradient-to-r ${achievement.gradient} rounded-xl`}
                >
                  <div className={`w-12 h-12 ${achievement.iconBg} rounded-full flex items-center justify-center mr-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {achievement.date}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
