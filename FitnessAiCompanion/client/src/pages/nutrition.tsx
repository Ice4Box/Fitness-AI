import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Camera, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProgressRing from "@/components/progress-ring";
import MealSection from "@/components/meal-section";
import type { NutritionTotals, MealSection as MealSectionType } from "@/lib/types";

// Mock user ID - in real app, this would come from auth context
const MOCK_USER_ID = 1;

const mealSections = [
  { type: "morning_snacks", title: "Morning Snacks", timeRange: "6:00 AM - 8:00 AM" },
  { type: "breakfast", title: "Breakfast", timeRange: "8:00 AM - 10:00 AM" },
  { type: "midday_snack", title: "Midday Snack", timeRange: "11:00 AM - 1:00 PM" },
  { type: "lunch", title: "Lunch", timeRange: "1:00 PM - 3:00 PM" },
  { type: "evening_snacks", title: "Evening Snacks", timeRange: "4:00 PM - 6:00 PM" },
  { type: "dinner", title: "Dinner", timeRange: "7:00 PM - 9:00 PM" },
];

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [addMealDialog, setAddMealDialog] = useState<{ open: boolean; mealType: string }>({
    open: false,
    mealType: "",
  });
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meals, isLoading: mealsLoading } = useQuery({
    queryKey: [`/api/meals/user/${MOCK_USER_ID}/date/${selectedDate}`],
  });

  const { data: foodItems } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const addMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      const response = await apiRequest("POST", "/api/meals", mealData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meals/user/${MOCK_USER_ID}/date/${selectedDate}`] });
      setAddMealDialog({ open: false, mealType: "" });
      setSelectedFoodId("");
      setQuantity("1");
      toast({
        title: "Meal Added!",
        description: "Your meal has been logged successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add meal",
        variant: "destructive",
      });
    },
  });

  const handleAddFood = (mealType: string) => {
    setAddMealDialog({ open: true, mealType });
  };

  const handleSubmitMeal = () => {
    if (!selectedFoodId || !quantity) {
      toast({
        title: "Missing Information",
        description: "Please select a food item and quantity.",
        variant: "destructive",
      });
      return;
    }

    const foodItem = foodItems?.find((item: any) => item.id === parseInt(selectedFoodId));
    if (!foodItem) return;

    const qty = parseFloat(quantity);
    addMealMutation.mutate({
      userId: MOCK_USER_ID,
      foodItemId: foodItem.id,
      mealType: addMealDialog.mealType,
      quantity: qty,
      calories: Math.round(foodItem.caloriesPerServing * qty),
      protein: Math.round(foodItem.proteinPerServing * qty * 10) / 10,
      carbs: Math.round(foodItem.carbsPerServing * qty * 10) / 10,
      fat: Math.round(foodItem.fatPerServing * qty * 10) / 10,
      date: new Date(selectedDate),
    });
  };

  // Calculate totals
  const calculateTotals = (): NutritionTotals => {
    if (!meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const allEntries = Object.values(meals).flat();
    return {
      calories: allEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0),
      protein: allEntries.reduce((sum: number, entry: any) => sum + entry.protein, 0),
      carbs: allEntries.reduce((sum: number, entry: any) => sum + entry.carbs, 0),
      fat: allEntries.reduce((sum: number, entry: any) => sum + entry.fat, 0),
    };
  };

  const totals = calculateTotals();
  const targets = { calories: 2200, protein: 150, carbs: 220, fat: 73 };

  // Prepare meal sections with data
  const mealSectionsWithData: MealSectionType[] = mealSections.map(section => {
    const entries = meals?.[section.type] || [];
    const entriesWithFoodInfo = entries.map((entry: any) => {
      const foodItem = foodItems?.find((item: any) => item.id === entry.foodItemId);
      return {
        ...entry,
        name: foodItem?.name || "Unknown Food",
        servingSize: `${entry.quantity} × ${foodItem?.servingSize || "serving"}`,
      };
    });

    return {
      ...section,
      entries: entriesWithFoodInfo,
      totalCalories: entries.reduce((sum: number, entry: any) => sum + entry.calories, 0),
    };
  });

  if (mealsLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 pb-20 md:pt-20 md:pb-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pt-20 md:pb-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-dark">Nutrition Tracker</h2>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <Camera className="w-4 h-4 mr-2" />
          Scan Meal
        </Button>
      </div>

      {/* Date Selector */}
      <div className="mb-8">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Daily Overview */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <ProgressRing
                percentage={Math.round((totals.calories / targets.calories) * 100)}
                color="#F59E0B"
              />
              <p className="font-semibold text-dark mt-3">Calories</p>
              <p className="text-sm text-gray-600">{totals.calories} / {targets.calories}</p>
            </div>

            <div className="text-center">
              <ProgressRing
                percentage={Math.round((totals.protein / targets.protein) * 100)}
                color="#10B981"
              />
              <p className="font-semibold text-dark mt-3">Protein</p>
              <p className="text-sm text-gray-600">{totals.protein}g / {targets.protein}g</p>
            </div>

            <div className="text-center">
              <ProgressRing
                percentage={Math.round((totals.carbs / targets.carbs) * 100)}
                color="#6366F1"
              />
              <p className="font-semibold text-dark mt-3">Carbs</p>
              <p className="text-sm text-gray-600">{totals.carbs}g / {targets.carbs}g</p>
            </div>

            <div className="text-center">
              <ProgressRing
                percentage={Math.round((totals.fat / targets.fat) * 100)}
                color="#EC4899"
              />
              <p className="font-semibold text-dark mt-3">Fat</p>
              <p className="text-sm text-gray-600">{totals.fat}g / {targets.fat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Sections */}
      <div className="space-y-6">
        {mealSectionsWithData.map((section) => (
          <MealSection
            key={section.type}
            section={section}
            onAddFood={handleAddFood}
          />
        ))}
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={addMealDialog.open} onOpenChange={(open) => setAddMealDialog({ ...addMealDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Food Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Food Item</label>
              <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a food item" />
                </SelectTrigger>
                <SelectContent>
                  {foodItems?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.caloriesPerServing} cal)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1.0"
                step="0.1"
                min="0.1"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setAddMealDialog({ open: false, mealType: "" })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitMeal}
                disabled={addMealMutation.isPending}
              >
                Add Food
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add FAB */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:scale-105 transition-all"
          onClick={() => handleAddFood("breakfast")}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
