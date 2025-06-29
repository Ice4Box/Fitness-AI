import { 
  users, exercises, workouts, foodItems, mealEntries, progressEntries, workoutSessions,
  type User, type InsertUser,
  type Exercise, type InsertExercise,
  type Workout, type InsertWorkout,
  type FoodItem, type InsertFoodItem,
  type MealEntry, type InsertMealEntry,
  type ProgressEntry, type InsertProgressEntry,
  type WorkoutSession, type InsertWorkoutSession
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Exercises
  getAllExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workouts
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined>;

  // Food Items
  getAllFoodItems(): Promise<FoodItem[]>;
  getFoodItemsByCategory(category: string): Promise<FoodItem[]>;
  searchFoodItems(query: string): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;

  // Meal Entries
  getMealEntriesByUserAndDate(userId: number, date: Date): Promise<MealEntry[]>;
  getMealEntriesByUserAndDateRange(userId: number, startDate: Date, endDate: Date): Promise<MealEntry[]>;
  createMealEntry(mealEntry: InsertMealEntry): Promise<MealEntry>;
  deleteMealEntry(id: number): Promise<boolean>;

  // Progress Entries
  getProgressEntriesByUserId(userId: number): Promise<ProgressEntry[]>;
  getLatestProgressEntry(userId: number): Promise<ProgressEntry | undefined>;
  createProgressEntry(progressEntry: InsertProgressEntry): Promise<ProgressEntry>;

  // Workout Sessions
  getWorkoutSessionsByUserId(userId: number): Promise<WorkoutSession[]>;
  createWorkoutSession(workoutSession: InsertWorkoutSession): Promise<WorkoutSession>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exercises: Map<number, Exercise>;
  private workouts: Map<number, Workout>;
  private foodItems: Map<number, FoodItem>;
  private mealEntries: Map<number, MealEntry>;
  private progressEntries: Map<number, ProgressEntry>;
  private workoutSessions: Map<number, WorkoutSession>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.workouts = new Map();
    this.foodItems = new Map();
    this.mealEntries = new Map();
    this.progressEntries = new Map();
    this.workoutSessions = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed default exercises
    const defaultExercises: InsertExercise[] = [
      // Gym Exercises
      { name: "Barbell Bench Press", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"], equipment: "barbell", instructions: "Lie on bench, grip bar wider than shoulders, lower to chest, press up", difficulty: "intermediate" },
      { name: "Overhead Press", category: "shoulders", primaryMuscles: ["shoulders"], secondaryMuscles: ["triceps", "core"], equipment: "barbell", instructions: "Stand with feet hip-width, press bar overhead", difficulty: "intermediate" },
      { name: "Dumbbell Incline Press", category: "chest", primaryMuscles: ["upper_chest"], secondaryMuscles: ["shoulders"], equipment: "dumbbells", instructions: "Set bench to 30-45 degrees, press dumbbells up and together", difficulty: "intermediate" },
      { name: "Close-Grip Bench Press", category: "triceps", primaryMuscles: ["triceps"], secondaryMuscles: ["chest"], equipment: "barbell", instructions: "Grip bar with hands closer than shoulder width, focus on tricep engagement", difficulty: "intermediate" },
      { name: "Barbell Rows", category: "back", primaryMuscles: ["lats", "rhomboids"], secondaryMuscles: ["biceps"], equipment: "barbell", instructions: "Hinge at hips, pull bar to lower chest", difficulty: "intermediate" },
      { name: "Lat Pulldowns", category: "back", primaryMuscles: ["lats"], secondaryMuscles: ["biceps"], equipment: "cable_machine", instructions: "Pull bar down to chest, squeeze lats", difficulty: "beginner" },
      { name: "Leg Press", category: "legs", primaryMuscles: ["quadriceps", "glutes"], secondaryMuscles: ["hamstrings"], equipment: "leg_press_machine", instructions: "Press weight with legs, control descent", difficulty: "beginner" },
      { name: "Squats", category: "legs", primaryMuscles: ["quadriceps", "glutes"], secondaryMuscles: ["core"], equipment: "barbell", instructions: "Feet shoulder-width apart, squat down keeping chest up", difficulty: "intermediate" },
      { name: "Deadlifts", category: "legs", primaryMuscles: ["hamstrings", "glutes"], secondaryMuscles: ["back", "core"], equipment: "barbell", instructions: "Hip hinge movement, keep bar close to body", difficulty: "advanced" },
      
      // Home/Bodyweight Exercises
      { name: "Push-ups", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"], equipment: "bodyweight", instructions: "Lower chest to floor, push up maintaining straight line", difficulty: "beginner" },
      { name: "Pull-ups", category: "back", primaryMuscles: ["lats"], secondaryMuscles: ["biceps"], equipment: "pull_up_bar", instructions: "Hang from bar, pull chin over bar", difficulty: "advanced" },
      { name: "Bodyweight Squats", category: "legs", primaryMuscles: ["quadriceps", "glutes"], secondaryMuscles: ["core"], equipment: "bodyweight", instructions: "Squat down as if sitting in chair, return to standing", difficulty: "beginner" },
      { name: "Lunges", category: "legs", primaryMuscles: ["quadriceps", "glutes"], secondaryMuscles: ["hamstrings"], equipment: "bodyweight", instructions: "Step forward, lower hips until both knees at 90 degrees", difficulty: "beginner" },
      { name: "Pike Push-ups", category: "shoulders", primaryMuscles: ["shoulders"], secondaryMuscles: ["triceps"], equipment: "bodyweight", instructions: "Hands and feet on ground in inverted V, lower head toward ground", difficulty: "intermediate" },
      { name: "Dips", category: "triceps", primaryMuscles: ["triceps"], secondaryMuscles: ["chest"], equipment: "parallel_bars", instructions: "Lower body by bending arms, push back up", difficulty: "intermediate" },
      { name: "Mountain Climbers", category: "cardio", primaryMuscles: ["core"], secondaryMuscles: ["shoulders", "legs"], equipment: "bodyweight", instructions: "Alternate bringing knees to chest in plank position", difficulty: "beginner" },
      { name: "Burpees", category: "cardio", primaryMuscles: ["full_body"], secondaryMuscles: ["core"], equipment: "bodyweight", instructions: "Squat down, jump back to plank, push-up, jump forward, jump up", difficulty: "intermediate" },
      
      // Calisthenics Progression
      { name: "Incline Push-ups", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"], equipment: "bodyweight", instructions: "Push-ups with hands elevated on bench or step", difficulty: "beginner" },
      { name: "Knee Push-ups", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"], equipment: "bodyweight", instructions: "Push-ups performed on knees instead of toes", difficulty: "beginner" },
      { name: "Diamond Push-ups", category: "triceps", primaryMuscles: ["triceps"], secondaryMuscles: ["chest"], equipment: "bodyweight", instructions: "Push-ups with hands in diamond shape", difficulty: "advanced" },
      { name: "Archer Push-ups", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: ["shoulders"], equipment: "bodyweight", instructions: "Push-up shifting weight to one side", difficulty: "advanced" },
      { name: "Assisted Pull-ups", category: "back", primaryMuscles: ["lats"], secondaryMuscles: ["biceps"], equipment: "resistance_band", instructions: "Pull-ups with band assistance", difficulty: "beginner" },
      { name: "Negative Pull-ups", category: "back", primaryMuscles: ["lats"], secondaryMuscles: ["biceps"], equipment: "pull_up_bar", instructions: "Jump to top position, lower slowly", difficulty: "intermediate" },
      { name: "Archer Pull-ups", category: "back", primaryMuscles: ["lats"], secondaryMuscles: ["biceps"], equipment: "pull_up_bar", instructions: "Pull-up to one side, extending other arm", difficulty: "advanced" },
      { name: "Pistol Squats", category: "legs", primaryMuscles: ["quadriceps"], secondaryMuscles: ["glutes", "core"], equipment: "bodyweight", instructions: "Single leg squat with other leg extended", difficulty: "advanced" },
      { name: "Assisted Pistol Squats", category: "legs", primaryMuscles: ["quadriceps"], secondaryMuscles: ["glutes"], equipment: "bodyweight", instructions: "Single leg squat holding support", difficulty: "intermediate" },
      { name: "Jump Squats", category: "legs", primaryMuscles: ["quadriceps", "glutes"], secondaryMuscles: ["calves"], equipment: "bodyweight", instructions: "Explosive squat with jump at top", difficulty: "intermediate" },
      { name: "Handstand Push-ups", category: "shoulders", primaryMuscles: ["shoulders"], secondaryMuscles: ["triceps"], equipment: "bodyweight", instructions: "Push-ups in handstand position against wall", difficulty: "advanced" },
      { name: "Wall Handstand Hold", category: "shoulders", primaryMuscles: ["shoulders"], secondaryMuscles: ["core"], equipment: "bodyweight", instructions: "Hold handstand position against wall", difficulty: "intermediate" },
      { name: "L-Sit", category: "core", primaryMuscles: ["core"], secondaryMuscles: ["shoulders"], equipment: "parallel_bars", instructions: "Sit with legs extended parallel to ground", difficulty: "advanced" },
      { name: "Plank", category: "core", primaryMuscles: ["core"], secondaryMuscles: ["shoulders"], equipment: "bodyweight", instructions: "Hold straight line from head to heels", difficulty: "beginner" },
      { name: "Side Plank", category: "core", primaryMuscles: ["core"], secondaryMuscles: ["shoulders"], equipment: "bodyweight", instructions: "Hold side position on one arm", difficulty: "intermediate" },
    ];

    defaultExercises.forEach(exercise => {
      const id = this.currentId++;
      this.exercises.set(id, { 
        ...exercise, 
        id, 
        createdAt: new Date(),
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        equipment: exercise.equipment || null,
        instructions: exercise.instructions || null,
        difficulty: exercise.difficulty || "intermediate"
      });
    });

    // Seed Indian food items
    const indianFoodItems: InsertFoodItem[] = [
      // Morning Snacks
      { name: "Almonds", category: "indian_snack", caloriesPerServing: 139, proteinPerServing: 5, carbsPerServing: 3, fatPerServing: 12, servingSize: "20 pieces", isIndian: false },
      { name: "Green Tea", category: "beverages", caloriesPerServing: 2, proteinPerServing: 0, carbsPerServing: 0, fatPerServing: 0, servingSize: "1 cup", isIndian: true },
      { name: "Apple", category: "fruits", caloriesPerServing: 78, proteinPerServing: 0, carbsPerServing: 21, fatPerServing: 0, servingSize: "1 medium (150g)", isIndian: false },
      
      // Breakfast
      { name: "Aloo Paratha", category: "indian_main", caloriesPerServing: 160, proteinPerServing: 4, carbsPerServing: 24, fatPerServing: 6, servingSize: "1 piece", isIndian: true },
      { name: "Fresh Curd", category: "indian_main", caloriesPerServing: 98, proteinPerServing: 8, carbsPerServing: 12, fatPerServing: 3, servingSize: "1 bowl (150g)", isIndian: true },
      { name: "Mixed Pickle", category: "indian_snack", caloriesPerServing: 25, proteinPerServing: 0, carbsPerServing: 2, fatPerServing: 2, servingSize: "1 tablespoon", isIndian: true },
      { name: "Chai with Milk & Sugar", category: "beverages", caloriesPerServing: 42, proteinPerServing: 2, carbsPerServing: 6, fatPerServing: 2, servingSize: "1 cup", isIndian: true },
      
      // Lunch Items
      { name: "Basmati Rice", category: "indian_main", caloriesPerServing: 205, proteinPerServing: 4, carbsPerServing: 45, fatPerServing: 0, servingSize: "1 cup cooked (150g)", isIndian: true },
      { name: "Dal Tadka", category: "indian_main", caloriesPerServing: 184, proteinPerServing: 12, carbsPerServing: 28, fatPerServing: 4, servingSize: "1 bowl (200g)", isIndian: true },
      { name: "Mixed Veg Curry", category: "indian_main", caloriesPerServing: 125, proteinPerServing: 4, carbsPerServing: 18, fatPerServing: 5, servingSize: "1 bowl (150g)", isIndian: true },
      { name: "Mixed Salad", category: "indian_snack", caloriesPerServing: 45, proteinPerServing: 2, carbsPerServing: 8, fatPerServing: 1, servingSize: "1 bowl with lemon dressing", isIndian: true },
      { name: "Cucumber Raita", category: "indian_main", caloriesPerServing: 66, proteinPerServing: 4, carbsPerServing: 8, fatPerServing: 2, servingSize: "Small bowl (100g)", isIndian: true },
      
      // Snacks
      { name: "Banana", category: "fruits", caloriesPerServing: 89, proteinPerServing: 1, carbsPerServing: 23, fatPerServing: 0, servingSize: "1 medium (120g)", isIndian: false },
      { name: "Masala Chai", category: "beverages", caloriesPerServing: 67, proteinPerServing: 3, carbsPerServing: 9, fatPerServing: 3, servingSize: "1 cup", isIndian: true },
      { name: "Samosa", category: "indian_snack", caloriesPerServing: 115, proteinPerServing: 3, carbsPerServing: 12, fatPerServing: 6, servingSize: "1 piece", isIndian: true },
      { name: "Ginger Tea", category: "beverages", caloriesPerServing: 65, proteinPerServing: 2, carbsPerServing: 8, fatPerServing: 3, servingSize: "1 cup", isIndian: true },
      
      // Dinner
      { name: "Whole Wheat Chapati", category: "indian_main", caloriesPerServing: 80, proteinPerServing: 3, carbsPerServing: 15, fatPerServing: 1, servingSize: "1 piece", isIndian: true },
      { name: "Chicken Curry", category: "indian_main", caloriesPerServing: 190, proteinPerServing: 25, carbsPerServing: 8, fatPerServing: 7, servingSize: "1 bowl (150g)", isIndian: true },
    ];

    indianFoodItems.forEach(foodItem => {
      const id = this.currentId++;
      this.foodItems.set(id, { ...foodItem, id, createdAt: new Date() });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      age: insertUser.age || null,
      weight: insertUser.weight || null,
      height: insertUser.height || null,
      activityLevel: insertUser.activityLevel || "moderate",
      fitnessGoal: insertUser.fitnessGoal || "body_recomposition",
      targetWeight: insertUser.targetWeight || null,
      dailyCalorieTarget: insertUser.dailyCalorieTarget || 2200,
      dailyProteinTarget: insertUser.dailyProteinTarget || 150,
      dailyCarbTarget: insertUser.dailyCarbTarget || 220,
      dailyFatTarget: insertUser.dailyFatTarget || 73
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Exercises
  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => exercise.category === category);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.currentId++;
    const exercise: Exercise = { ...insertExercise, id, createdAt: new Date() };
    this.exercises.set(id, exercise);
    return exercise;
  }

  // Workouts
  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => workout.userId === userId);
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentId++;
    const workout: Workout = { 
      ...insertWorkout, 
      id, 
      createdAt: new Date(),
      completedAt: null,
      difficulty: insertWorkout.difficulty || null,
      duration: insertWorkout.duration || null,
      calories: insertWorkout.calories || null,
      level: insertWorkout.level || null,
      completed: insertWorkout.completed || null
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    const updatedWorkout = { ...workout, ...updates };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  // Food Items
  async getAllFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(item => item.category === category);
  }

  async searchFoodItems(query: string): Promise<FoodItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foodItems.values()).filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createFoodItem(insertFoodItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.currentId++;
    const foodItem: FoodItem = { ...insertFoodItem, id, createdAt: new Date() };
    this.foodItems.set(id, foodItem);
    return foodItem;
  }

  // Meal Entries
  async getMealEntriesByUserAndDate(userId: number, date: Date): Promise<MealEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.mealEntries.values()).filter(entry =>
      entry.userId === userId &&
      entry.date >= startOfDay &&
      entry.date <= endOfDay
    );
  }

  async getMealEntriesByUserAndDateRange(userId: number, startDate: Date, endDate: Date): Promise<MealEntry[]> {
    return Array.from(this.mealEntries.values()).filter(entry =>
      entry.userId === userId &&
      entry.date >= startDate &&
      entry.date <= endDate
    );
  }

  async createMealEntry(insertMealEntry: InsertMealEntry): Promise<MealEntry> {
    const id = this.currentId++;
    const mealEntry: MealEntry = { ...insertMealEntry, id, createdAt: new Date() };
    this.mealEntries.set(id, mealEntry);
    return mealEntry;
  }

  async deleteMealEntry(id: number): Promise<boolean> {
    return this.mealEntries.delete(id);
  }

  // Progress Entries
  async getProgressEntriesByUserId(userId: number): Promise<ProgressEntry[]> {
    return Array.from(this.progressEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getLatestProgressEntry(userId: number): Promise<ProgressEntry | undefined> {
    const entries = await this.getProgressEntriesByUserId(userId);
    return entries[0];
  }

  async createProgressEntry(insertProgressEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const id = this.currentId++;
    const progressEntry: ProgressEntry = { ...insertProgressEntry, id, createdAt: new Date() };
    this.progressEntries.set(id, progressEntry);
    return progressEntry;
  }

  // Workout Sessions
  async getWorkoutSessionsByUserId(userId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
  }

  async createWorkoutSession(insertWorkoutSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentId++;
    const workoutSession: WorkoutSession = { ...insertWorkoutSession, id, createdAt: new Date() };
    this.workoutSessions.set(id, workoutSession);
    return workoutSession;
  }
}

export const storage = new MemStorage();
