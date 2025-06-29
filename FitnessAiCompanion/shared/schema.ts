import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age"),
  weight: real("weight"), // in kg
  height: real("height"), // in cm
  gender: text("gender").default("male"), // male, female, other
  activityLevel: text("activity_level").default("moderate"), // sedentary, light, moderate, active, very_active
  fitnessGoal: text("fitness_goal").default("body_recomposition"), // bulking, cutting, body_recomposition, strength, calisthenics
  targetWeight: real("target_weight"),
  bodyFatPercentage: real("body_fat_percentage"),
  muscleMass: real("muscle_mass"),
  // Calculated fields updated automatically
  bmi: real("bmi"),
  bmr: real("bmr"), // Basal Metabolic Rate
  tdee: real("tdee"), // Total Daily Energy Expenditure
  // Dynamic nutrition targets based on goals
  dailyCalorieTarget: integer("daily_calorie_target").default(2200),
  dailyProteinTarget: integer("daily_protein_target").default(150),
  dailyCarbTarget: integer("daily_carb_target").default(220),
  dailyFatTarget: integer("daily_fat_target").default(73),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // chest, back, shoulders, legs, etc.
  primaryMuscles: text("primary_muscles").array(),
  secondaryMuscles: text("secondary_muscles").array(),
  equipment: text("equipment"),
  instructions: text("instructions"),
  difficulty: text("difficulty").default("intermediate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  goal: text("goal").notNull(), // body_recomposition, bulking, cutting, strength, calisthenics
  workoutType: text("workout_type").notNull(), // gym, home, calisthenics
  exercises: jsonb("exercises").notNull(), // array of exercise objects with sets/reps
  duration: integer("duration"), // in minutes
  calories: integer("calories"),
  difficulty: text("difficulty").default("intermediate"),
  level: text("level").default("beginner"), // beginner, intermediate, advanced
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // indian_main, indian_snack, fruits, beverages, etc.
  caloriesPerServing: integer("calories_per_serving").notNull(),
  proteinPerServing: real("protein_per_serving").default(0),
  carbsPerServing: real("carbs_per_serving").default(0),
  fatPerServing: real("fat_per_serving").default(0),
  servingSize: text("serving_size"),
  isIndian: boolean("is_indian").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealEntries = pgTable("meal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  foodItemId: integer("food_item_id").references(() => foodItems.id).notNull(),
  mealType: text("meal_type").notNull(), // morning_snacks, breakfast, midday_snack, lunch, evening_snacks, dinner
  quantity: real("quantity").default(1),
  calories: integer("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressEntries = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  weight: real("weight"),
  bodyFatPercentage: real("body_fat_percentage"),
  muscleMass: real("muscle_mass"),
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workoutId: integer("workout_id").references(() => workouts.id).notNull(),
  duration: integer("duration"), // actual duration in minutes
  caloriesBurned: integer("calories_burned"),
  completedExercises: jsonb("completed_exercises"), // track which exercises were completed
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
});

export const insertMealEntrySchema = createInsertSchema(mealEntries).omit({
  id: true,
  createdAt: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type MealEntry = typeof mealEntries.$inferSelect;
export type InsertMealEntry = z.infer<typeof insertMealEntrySchema>;

export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
