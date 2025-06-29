export interface DashboardStats {
  todayCalories: number;
  weekWorkoutCount: number;
  currentWeight: number;
  waterIntake: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSection {
  type: string;
  title: string;
  timeRange: string;
  entries: any[];
  totalCalories: number;
}

export interface WorkoutGoal {
  id: string;
  name: string;
  description: string;
  active: boolean;
}
