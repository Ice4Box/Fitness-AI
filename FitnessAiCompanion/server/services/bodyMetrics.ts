// Body metrics calculations for fitness tracking
// Provides BMI, BMR, TDEE, and dynamic calorie recommendations

export interface BodyMetrics {
  bmi: number;
  bmiCategory: string;
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'bulking' | 'cutting' | 'body_recomposition' | 'strength' | 'maintenance';
  bodyFatPercentage?: number;
}

// BMI Calculation and Categories
export function calculateBMI(weight: number, height: number): number {
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Basal Metabolic Rate using Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  
  // Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    // Use average for other genders
    bmr -= 78;
  }
  
  return Math.round(bmr);
}

// Total Daily Energy Expenditure
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    sedentary: 1.2,     // Little to no exercise
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    active: 1.725,      // Heavy exercise 6-7 days/week
    very_active: 1.9    // Very heavy exercise, physical job
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  return Math.round(bmr * multiplier);
}

// Dynamic calorie targets based on fitness goals
export function calculateCalorieTarget(tdee: number, fitnessGoal: string, weight: number): number {
  switch (fitnessGoal) {
    case 'cutting':
      // 15-25% deficit for fat loss (more aggressive: 500-750 cal deficit)
      return Math.round(tdee * 0.8); // 20% deficit
    
    case 'bulking':
      // 10-20% surplus for muscle gain (300-500 cal surplus)
      return Math.round(tdee * 1.15); // 15% surplus
    
    case 'body_recomposition':
      // Slight deficit or maintenance (body recomp at maintenance or small deficit)
      return Math.round(tdee * 0.95); // 5% deficit
    
    case 'strength':
      // Maintenance to slight surplus for strength gains
      return Math.round(tdee * 1.05); // 5% surplus
    
    case 'maintenance':
    default:
      return tdee;
  }
}

// Protein target based on goals and body weight
export function calculateProteinTarget(weight: number, fitnessGoal: string, bodyFatPercentage?: number): number {
  let proteinPerKg: number;
  
  // Use lean body mass if body fat percentage is available
  const leanBodyMass = bodyFatPercentage ? weight * (1 - bodyFatPercentage / 100) : weight;
  const targetWeight = bodyFatPercentage ? leanBodyMass : weight;
  
  switch (fitnessGoal) {
    case 'bulking':
      proteinPerKg = 2.2; // 2.0-2.4g per kg for muscle gain
      break;
    case 'cutting':
      proteinPerKg = 2.4; // 2.2-2.6g per kg to preserve muscle in deficit
      break;
    case 'body_recomposition':
      proteinPerKg = 2.2; // 2.0-2.4g per kg for simultaneous muscle gain/fat loss
      break;
    case 'strength':
      proteinPerKg = 2.0; // 1.8-2.2g per kg for strength training
      break;
    default:
      proteinPerKg = 1.8; // General active individual
  }
  
  return Math.round(targetWeight * proteinPerKg);
}

// Carb target based on activity level and goals
export function calculateCarbTarget(calorieTarget: number, proteinTarget: number, fitnessGoal: string, activityLevel: string): number {
  const proteinCalories = proteinTarget * 4; // 4 cal per gram of protein
  let carbPercentage: number;
  
  // Adjust carb intake based on goals and activity
  if (fitnessGoal === 'cutting') {
    carbPercentage = activityLevel === 'very_active' ? 0.35 : 0.25; // Lower carbs for cutting
  } else if (fitnessGoal === 'bulking') {
    carbPercentage = 0.45; // Higher carbs for bulking
  } else {
    carbPercentage = 0.35; // Moderate carbs for recomp/maintenance
  }
  
  const carbCalories = calorieTarget * carbPercentage;
  return Math.round(carbCalories / 4); // 4 cal per gram of carbs
}

// Fat target (remainder after protein and carbs)
export function calculateFatTarget(calorieTarget: number, proteinTarget: number, carbTarget: number): number {
  const proteinCalories = proteinTarget * 4;
  const carbCalories = carbTarget * 4;
  const fatCalories = calorieTarget - proteinCalories - carbCalories;
  
  // Ensure minimum fat intake (20% of calories)
  const minFatCalories = calorieTarget * 0.2;
  const finalFatCalories = Math.max(fatCalories, minFatCalories);
  
  return Math.round(finalFatCalories / 9); // 9 cal per gram of fat
}

// Main function to calculate all body metrics
export function calculateBodyMetrics(profile: UserProfile): BodyMetrics {
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, profile.fitnessGoal, profile.weight);
  const proteinTarget = calculateProteinTarget(profile.weight, profile.fitnessGoal, profile.bodyFatPercentage);
  const carbTarget = calculateCarbTarget(calorieTarget, proteinTarget, profile.fitnessGoal, profile.activityLevel);
  const fatTarget = calculateFatTarget(calorieTarget, proteinTarget, carbTarget);
  
  return {
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    bmiCategory,
    bmr,
    tdee,
    calorieTarget,
    proteinTarget,
    carbTarget,
    fatTarget
  };
}

// Helper function to get goal-specific recommendations
export function getGoalRecommendations(fitnessGoal: string) {
  const recommendations = {
    bulking: {
      title: "Lean Bulking",
      description: "Build muscle with minimal fat gain",
      calorieSurplus: "15% above maintenance",
      proteinFocus: "High protein for muscle synthesis",
      trainingTips: "Progressive overload with compound movements",
      timeframe: "Aim for 0.5-1 lb weight gain per week"
    },
    cutting: {
      title: "Fat Loss",
      description: "Lose fat while preserving muscle",
      calorieDeficit: "20% below maintenance",
      proteinFocus: "Very high protein to preserve muscle",
      trainingTips: "Maintain strength training intensity",
      timeframe: "Aim for 1-2 lb fat loss per week"
    },
    body_recomposition: {
      title: "Body Recomposition",
      description: "Simultaneous muscle gain and fat loss",
      calorieBalance: "Slight deficit or maintenance",
      proteinFocus: "High protein for muscle synthesis",
      trainingTips: "Progressive strength training essential",
      timeframe: "Slower progress, focus on body composition changes"
    },
    strength: {
      title: "Strength Building",
      description: "Maximize strength and power",
      calorieBalance: "Maintenance to slight surplus",
      proteinFocus: "Adequate protein for recovery",
      trainingTips: "Heavy compound lifts, longer rest periods",
      timeframe: "Focus on performance metrics over scale weight"
    },
    maintenance: {
      title: "Maintenance",
      description: "Maintain current physique and health",
      calorieBalance: "Match energy expenditure",
      proteinFocus: "Moderate protein for general health",
      trainingTips: "Consistent training for health benefits",
      timeframe: "Long-term sustainable approach"
    }
  };
  
  return recommendations[fitnessGoal as keyof typeof recommendations] || recommendations.maintenance;
}