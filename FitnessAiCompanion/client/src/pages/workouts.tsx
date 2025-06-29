import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Clock, Flame, TrendingUp, Dumbbell, CheckCircle, Play, Home, Building2, Target, Zap, Users, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock user ID - in real app, this would come from auth context
const MOCK_USER_ID = 1;

const workoutGoals = [
  { id: "body_recomposition", name: "Body Recomp", description: "Build muscle while losing fat", icon: Target },
  { id: "bulking", name: "Bulking", description: "Focus on muscle gain", icon: TrendingUp },
  { id: "cutting", name: "Cutting", description: "Focus on fat loss", icon: Flame },
  { id: "strength", name: "Strength", description: "Build maximum strength", icon: Dumbbell },
  { id: "calisthenics", name: "Calisthenics", description: "Master bodyweight movements", icon: Award },
];

const workoutTypes = [
  { id: "gym", name: "Gym Workout", description: "Equipment-based training", icon: Building2 },
  { id: "home", name: "Home Workout", description: "Minimal equipment needed", icon: Home },
  { id: "calisthenics", name: "Calisthenics", description: "Bodyweight mastery", icon: Users },
];

const levels = [
  { id: "beginner", name: "Beginner", description: "Just starting out" },
  { id: "intermediate", name: "Intermediate", description: "Some experience" },
  { id: "advanced", name: "Advanced", description: "Expert level" },
];

export default function Workouts() {
  const [selectedGoal, setSelectedGoal] = useState("body_recomposition");
  const [selectedWorkoutType, setSelectedWorkoutType] = useState("gym");
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workouts, isLoading } = useQuery({
    queryKey: [`/api/workouts/user/${MOCK_USER_ID}`],
  });

  const generateWorkoutMutation = useMutation({
    mutationFn: async ({ goal, workoutType, level }: { goal: string; workoutType: string; level: string }) => {
      const response = await apiRequest("POST", "/api/workouts/generate", {
        userId: MOCK_USER_ID,
        goal,
        workoutType,
        level,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/user/${MOCK_USER_ID}`] });
      toast({
        title: "Workout Generated!",
        description: "Your personalized AI workout is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout",
        variant: "destructive",
      });
    },
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async ({ workoutId, data }: { workoutId: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/workouts/${workoutId}/complete`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/user/${MOCK_USER_ID}`] });
      toast({
        title: "Workout Completed!",
        description: "Great job! Your progress has been recorded.",
      });
    },
  });

  const handleGenerateWorkout = () => {
    generateWorkoutMutation.mutate({ 
      goal: selectedGoal, 
      workoutType: selectedWorkoutType, 
      level: selectedLevel 
    });
  };

  const handleCompleteWorkout = (workoutId: number) => {
    // Mock completion data - in real app, this would come from workout tracking
    completeWorkoutMutation.mutate({
      workoutId,
      data: {
        duration: 45,
        caloriesBurned: 380,
        completedExercises: [],
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 pb-20 md:pt-20 md:pb-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const latestWorkout = workouts?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
            AI Workout Generator
          </h1>
          <p className="text-xl text-slate-300">
            Get personalized workout plans for gym, home, and calisthenics training
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="generate" className="data-[state=active]:bg-emerald-600">
              Generate Workout
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-emerald-600">
              My Workouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Workout Type Selection */}
            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Workout Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {workoutTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedWorkoutType === type.id
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                        }`}
                        onClick={() => setSelectedWorkoutType(type.id)}
                      >
                        <div className="text-center">
                          <IconComponent className="h-8 w-8 mx-auto mb-3 text-emerald-400" />
                          <div className="text-lg font-semibold mb-2">{type.name}</div>
                          <div className="text-sm text-slate-400">{type.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fitness Goal Selection */}
            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fitness Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {workoutGoals.map((goal) => {
                    const IconComponent = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedGoal === goal.id
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                        }`}
                        onClick={() => setSelectedGoal(goal.id)}
                      >
                        <div className="text-center">
                          <IconComponent className="h-6 w-6 mx-auto mb-2 text-emerald-400" />
                          <div className="text-sm font-semibold mb-1">{goal.name}</div>
                          <div className="text-xs text-slate-400">{goal.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Level Selection */}
            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Experience Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id} className="text-white hover:bg-slate-700">
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-slate-400">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateWorkout}
                disabled={generateWorkoutMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-12 py-4 text-lg font-semibold rounded-lg"
              >
                {generateWorkoutMutation.isPending ? (
                  <>
                    <Bot className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-5 w-5" />
                    Generate AI Workout
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6">
              {workouts && Array.isArray(workouts) && workouts.length > 0 ? (
                workouts.map((workout: any) => (
                  <Card key={workout.id} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-emerald-400">{workout.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                            {workout.workoutType || 'gym'}
                          </Badge>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {workout.level || 'beginner'}
                          </Badge>
                          <Badge 
                            variant={workout.completed ? "default" : "outline"}
                            className={workout.completed ? "bg-emerald-600" : "border-slate-500 text-slate-400"}
                          >
                            {workout.completed ? <CheckCircle className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                            {workout.completed ? "Completed" : "Ready"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                          <div className="text-sm text-slate-400">Duration</div>
                          <div className="font-semibold">{workout.duration || 0} min</div>
                        </div>
                        <div className="text-center">
                          <Flame className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                          <div className="text-sm text-slate-400">Calories</div>
                          <div className="font-semibold">{workout.calories || 0}</div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                          <div className="text-sm text-slate-400">Difficulty</div>
                          <div className="font-semibold capitalize">{workout.difficulty || 'Medium'}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-300">Exercises:</h4>
                        {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 ? (
                          <div className="grid gap-2">
                            {workout.exercises.slice(0, 3).map((exercise: any, index: number) => (
                              <div key={index} className="flex justify-between items-center bg-slate-700/50 rounded-lg p-3">
                                <span className="font-medium">{exercise.name}</span>
                                <span className="text-sm text-slate-400">{exercise.sets} sets × {exercise.reps}</span>
                              </div>
                            ))}
                            {workout.exercises.length > 3 && (
                              <div className="text-center text-sm text-slate-400">
                                +{workout.exercises.length - 3} more exercises
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400">No exercises available</div>
                        )}
                      </div>

                      {!workout.completed && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleCompleteWorkout(workout.id)}
                            disabled={completeWorkoutMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Dumbbell className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                    <h3 className="text-xl font-semibold mb-2 text-slate-300">No Workouts Yet</h3>
                    <p className="text-slate-400 mb-6">Generate your first AI-powered workout to get started!</p>
                    <Button
                      onClick={() => {
                        const tabs = document.querySelector('[data-state="active"]');
                        if (tabs) {
                          const generateTab = document.querySelector('[value="generate"]');
                          if (generateTab) {
                            (generateTab as HTMLElement).click();
                          }
                        }
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Create Workout
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
