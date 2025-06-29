import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Apple, Coffee, Utensils } from "lucide-react";
import type { MealSection as MealSectionType } from "@/lib/types";

interface MealSectionProps {
  section: MealSectionType;
  onAddFood: (mealType: string) => void;
}

const getMealIcon = (mealType: string) => {
  switch (mealType) {
    case "breakfast":
    case "dinner":
      return Utensils;
    case "morning_snacks":
    case "midday_snack":
    case "evening_snacks":
      return Apple;
    default:
      return Coffee;
  }
};

export default function MealSection({ section, onAddFood }: MealSectionProps) {
  const Icon = getMealIcon(section.type);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-l-4 border-l-secondary p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="text-lg font-semibold text-dark">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.timeRange}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-dark">{section.totalCalories} cal</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddFood(section.type)}
                className="text-primary hover:text-primary/80 p-0 h-auto"
              >
                + Add Food
              </Button>
            </div>
          </div>

          {section.entries.length > 0 ? (
            <div className="space-y-3">
              {section.entries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg mr-3 flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-dark">{entry.name}</h4>
                      <p className="text-sm text-gray-600">{entry.servingSize}</p>
                    </div>
                  </div>
                  <span className="font-medium text-dark">{entry.calories} cal</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No meals added yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddFood(section.type)}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Meal
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
