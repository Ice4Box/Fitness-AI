import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkoutSchema, insertMealEntrySchema, insertProgressEntrySchema } from "@shared/schema";
import { generateWorkoutPlan, generateMealSuggestions, analyzeProgress } from "./services/openai";
import { calculateBodyMetrics, type UserProfile, type BodyMetrics } from "./services/bodyMetrics";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/exercises/category/:category", async (req, res) => {
    try {
      const exercises = await storage.getExercisesByCategory(req.params.category);
      res.json(exercises);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Workout routes
  app.get("/api/workouts/user/:userId", async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByUserId(parseInt(req.params.userId));
      res.json(workouts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/workouts/generate", async (req, res) => {
    try {
      const { userId, goal, workoutType = "gym", level = "beginner" } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const exercises = await storage.getAllExercises();
      const workoutPlan = await generateWorkoutPlan(user, exercises, goal, workoutType, level);
      
      const workout = await storage.createWorkout({
        userId,
        name: workoutPlan.name,
        goal: workoutPlan.goal,
        workoutType: workoutPlan.workoutType,
        level: workoutPlan.level,
        exercises: workoutPlan.exercises,
        duration: workoutPlan.duration,
        calories: workoutPlan.estimatedCalories,
        difficulty: workoutPlan.difficulty,

      });

      res.json(workout);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/workouts/:id/complete", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const { duration, caloriesBurned, completedExercises } = req.body;
      
      const workout = await storage.updateWorkout(workoutId, {
        completed: true,
        completedAt: new Date(),
      });

      if (workout) {
        await storage.createWorkoutSession({
          userId: workout.userId,
          workoutId,
          duration,
          caloriesBurned,
          completedExercises,
          completedAt: new Date(),
        });
      }

      res.json(workout);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Food routes
  app.get("/api/food-items", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let foodItems;
      if (search) {
        foodItems = await storage.searchFoodItems(search as string);
      } else if (category) {
        foodItems = await storage.getFoodItemsByCategory(category as string);
      } else {
        foodItems = await storage.getAllFoodItems();
      }
      
      res.json(foodItems);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Meal routes
  app.get("/api/meals/user/:userId/date/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = new Date(req.params.date);
      const mealEntries = await storage.getMealEntriesByUserAndDate(userId, date);
      
      // Group by meal type
      const groupedMeals = mealEntries.reduce((acc, entry) => {
        if (!acc[entry.mealType]) {
          acc[entry.mealType] = [];
        }
        acc[entry.mealType].push(entry);
        return acc;
      }, {} as Record<string, typeof mealEntries>);

      res.json(groupedMeals);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const mealData = insertMealEntrySchema.parse(req.body);
      const mealEntry = await storage.createMealEntry(mealData);
      res.json(mealEntry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      const success = await storage.deleteMealEntry(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Meal entry not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/meals/suggestions", async (req, res) => {
    try {
      const { userId, mealType, targetCalories } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const suggestions = await generateMealSuggestions(user, mealType, targetCalories);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress routes
  app.get("/api/progress/user/:userId", async (req, res) => {
    try {
      const progressEntries = await storage.getProgressEntriesByUserId(parseInt(req.params.userId));
      res.json(progressEntries);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressEntrySchema.parse(req.body);
      const progressEntry = await storage.createProgressEntry(progressData);
      res.json(progressEntry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/progress/analyze", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const progressData = await storage.getProgressEntriesByUserId(userId);
      const workoutSessions = await storage.getWorkoutSessionsByUserId(userId);
      
      const analysis = await analyzeProgress(user, [...progressData, ...workoutSessions]);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [todayMeals, weekWorkouts, latestProgress] = await Promise.all([
        storage.getMealEntriesByUserAndDate(userId, today),
        storage.getWorkoutSessionsByUserId(userId),
        storage.getLatestProgressEntry(userId),
      ]);

      const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const weekWorkoutCount = weekWorkouts.filter(w => w.completedAt && w.completedAt >= weekAgo).length;

      res.json({
        todayCalories,
        weekWorkoutCount,
        currentWeight: latestProgress?.weight || 0,
        waterIntake: 6, // Mock data - would track separately
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // BMI and Body Metrics routes
  app.get("/api/body-metrics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has required data for calculations
      if (!user.weight || !user.height || !user.age) {
        return res.status(400).json({ 
          message: "Missing required data for body metrics calculation",
          required: ["weight", "height", "age"]
        });
      }

      const userProfile: UserProfile = {
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: (user.gender as 'male' | 'female' | 'other') || 'male',
        activityLevel: (user.activityLevel as UserProfile['activityLevel']) || 'moderate',
        fitnessGoal: (user.fitnessGoal as UserProfile['fitnessGoal']) || 'body_recomposition',
        bodyFatPercentage: user.bodyFatPercentage || undefined
      };

      const bodyMetrics = calculateBodyMetrics(userProfile);
      
      // Update user with calculated metrics
      await storage.updateUser(userId, {
        bmi: bodyMetrics.bmi,
        bmr: bodyMetrics.bmr,
        tdee: bodyMetrics.tdee,
        dailyCalorieTarget: bodyMetrics.calorieTarget,
        dailyProteinTarget: bodyMetrics.proteinTarget,
        dailyCarbTarget: bodyMetrics.carbTarget,
        dailyFatTarget: bodyMetrics.fatTarget
      });

      res.json(bodyMetrics);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update user profile with new body metrics calculation
  app.put("/api/users/:userId/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { weight, height, age, gender, activityLevel, fitnessGoal, bodyFatPercentage } = req.body;

      // Update user with new profile data
      const updatedUser = await storage.updateUser(userId, {
        weight,
        height,
        age,
        gender,
        activityLevel,
        fitnessGoal,
        bodyFatPercentage
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Recalculate body metrics if we have the required data
      if (weight && height && age) {
        const userProfile: UserProfile = {
          weight,
          height,
          age,
          gender: gender || 'male',
          activityLevel: activityLevel || 'moderate',
          fitnessGoal: fitnessGoal || 'body_recomposition',
          bodyFatPercentage: bodyFatPercentage || undefined
        };

        const bodyMetrics = calculateBodyMetrics(userProfile);
        
        // Update user with calculated metrics
        const finalUser = await storage.updateUser(userId, {
          bmi: bodyMetrics.bmi,
          bmr: bodyMetrics.bmr,
          tdee: bodyMetrics.tdee,
          dailyCalorieTarget: bodyMetrics.calorieTarget,
          dailyProteinTarget: bodyMetrics.proteinTarget,
          dailyCarbTarget: bodyMetrics.carbTarget,
          dailyFatTarget: bodyMetrics.fatTarget
        });

        res.json({ user: finalUser, bodyMetrics });
      } else {
        res.json({ user: updatedUser });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
