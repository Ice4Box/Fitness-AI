import OpenAI from "openai";
import type { User, Exercise } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface WorkoutPlan {
  name: string;
  goal: string;
  workoutType: string;
  level: string;
  exercises: Array<{
    exerciseId: number;
    name: string;
    sets: number;
    reps: string;
    restTime: string;
    notes?: string;
  }>;
  duration: number;
  estimatedCalories: number;
  difficulty: string;
}

export interface MealSuggestion {
  name: string;
  category: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  servingSize: string;
  description: string;
}

export async function generateWorkoutPlan(
  user: User,
  exercises: Exercise[],
  goal: string,
  workoutType: string = "gym",
  level: string = "beginner"
): Promise<WorkoutPlan> {
  try {
    // Filter exercises based on workout type and equipment
    const filteredExercises = exercises.filter(exercise => {
      if (workoutType === "gym") {
        return ["barbell", "dumbbells", "cable_machine", "leg_press_machine"].includes(exercise.equipment || "");
      } else if (workoutType === "home") {
        return ["bodyweight", "resistance_band", "pull_up_bar"].includes(exercise.equipment || "");
      } else if (workoutType === "calisthenics") {
        return exercise.equipment === "bodyweight" || exercise.equipment === "pull_up_bar" || exercise.equipment === "parallel_bars";
      }
      return true;
    });

    const workoutTypeDescription = {
      gym: "gym-based training with weights and machines",
      home: "home workout using minimal equipment",
      calisthenics: "bodyweight-focused calisthenics progression"
    }[workoutType] || "general fitness training";

    const levelDescription = {
      beginner: "Focus on form, basic movements, and building foundation",
      intermediate: "Progressive overload with moderate complexity",
      advanced: "Complex movements and advanced training techniques"
    }[level] || "appropriate difficulty progression";

    const prompt = `
Create a personalized ${workoutTypeDescription} workout plan for a user with the following details:
- Age: ${user.age}
- Weight: ${user.weight}kg
- Fitness Goal: ${goal}
- Activity Level: ${user.activityLevel}
- Workout Type: ${workoutType}
- Level: ${level}

Available exercises: ${JSON.stringify(filteredExercises)}

Requirements for ${workoutType} ${level} workout:
- ${levelDescription}
- ${workoutType === "calisthenics" ? "Progressive calisthenics exercises with proper scaling" : "Equipment appropriate for " + workoutType}
- Focus on ${goal} specific training
- Include 4-8 exercises appropriate for ${level} level
- Specify sets, reps, and rest times
- Consider workout progression and scaling
- Estimate total duration and calories burned
- Provide exercise selection reasoning and form cues

${workoutType === "calisthenics" ? `
Special considerations for calisthenics:
- If beginner: Use assisted variations, easier progressions
- If intermediate: Standard movements with proper form
- If advanced: One-arm variations, weighted movements, skills
- Include progression tips for each exercise
` : ""}

Respond with JSON in this exact format:
{
  "name": "workout name",
  "goal": "${goal}",
  "workoutType": "${workoutType}",
  "level": "${level}",
  "exercises": [
    {
      "exerciseId": number,
      "name": "exercise name",
      "sets": number,
      "reps": "rep range (e.g., 6-8 or 30 seconds)",
      "restTime": "rest duration (e.g., 2 min)",
      "notes": "form cues and progression tips"
    }
  ],
  "duration": number_in_minutes,
  "estimatedCalories": number,
  "difficulty": "beginner|intermediate|advanced"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a certified fitness trainer specializing in Indian fitness preferences and body types. Create effective, safe workout plans."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as WorkoutPlan;
  } catch (error) {
    throw new Error(`Failed to generate workout plan: ${error}`);
  }
}

export async function generateMealSuggestions(
  user: User,
  mealType: string,
  targetCalories: number
): Promise<MealSuggestion[]> {
  try {
    const prompt = `
Suggest 3-5 traditional Indian dishes for ${mealType} with approximately ${targetCalories} total calories.

User details:
- Weight: ${user.weight}kg
- Fitness Goal: ${user.fitnessGoal}
- Daily Calorie Target: ${user.dailyCalorieTarget}

Requirements:
- Focus on authentic Indian cuisine
- Include nutritional information per serving
- Consider meal timing and digestion
- Provide variety in ingredients and preparation methods

Respond with JSON array in this exact format:
[
  {
    "name": "dish name in English",
    "category": "indian_main|indian_snack|beverages|fruits",
    "caloriesPerServing": number,
    "proteinPerServing": number,
    "carbsPerServing": number,
    "fatPerServing": number,
    "servingSize": "serving description",
    "description": "brief preparation or ingredient description"
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutritionist specializing in Indian cuisine and traditional cooking methods. Provide accurate nutritional information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.suggestions || result;
  } catch (error) {
    throw new Error(`Failed to generate meal suggestions: ${error}`);
  }
}

export async function analyzeProgress(
  user: User,
  progressData: any[]
): Promise<{
  insights: string[];
  recommendations: string[];
  nextGoals: string[];
}> {
  try {
    const prompt = `
Analyze fitness progress data and provide personalized insights:

User: ${user.username}
Current Weight: ${user.weight}kg
Target Weight: ${user.targetWeight}kg
Fitness Goal: ${user.fitnessGoal}

Progress Data: ${JSON.stringify(progressData)}

Provide analysis in JSON format:
{
  "insights": ["key insight 1", "key insight 2", "key insight 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "nextGoals": ["next milestone 1", "next milestone 2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fitness coach providing encouraging, data-driven insights for Indian fitness enthusiasts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result;
  } catch (error) {
    throw new Error(`Failed to analyze progress: ${error}`);
  }
}
