// Food Database with Oil Content based on research data
// Format: { name, oilGrams, servingGrams, category, totalCalories, oilCalories }

export interface FoodItem {
  id: string;
  name: string;
  oilGrams: number; // grams of oil per serving
  servingGrams: number; // serving size in grams
  category: 'deep_fried' | 'rich_curry' | 'gravy' | 'dal' | 'rice' | 'bread' | 'south_indian' | 'tandoori' | 'street_food';
  countable?: boolean; // like samosa, paratha
  totalCalories?: number; // total calories per serving
  oilCalories?: number; // calories from oil per serving
}

export const foodDatabase: FoodItem[] = [
  // User's Provided Dataset - 16 Indian Food Items
  
  // Deep Fried Items
  { id: '1', name: 'Samosa', oilGrams: 12, servingGrams: 100, category: 'deep_fried', countable: true, totalCalories: 260, oilCalories: 108 },
  { id: '2', name: 'Pakora', oilGrams: 15, servingGrams: 100, category: 'deep_fried', totalCalories: 300, oilCalories: 135 },
  { id: '3', name: 'Poori', oilGrams: 5, servingGrams: 25, category: 'deep_fried', countable: true, totalCalories: 110, oilCalories: 45 },
  { id: '4', name: 'Kachori', oilGrams: 14, servingGrams: 100, category: 'deep_fried', countable: true, totalCalories: 300, oilCalories: 126 },
  
  // Rica Curries & Main Dishes
  { id: '5', name: 'Dal Tadka', oilGrams: 8, servingGrams: 200, category: 'dal', totalCalories: 220, oilCalories: 72 },
  { id: '6', name: 'Paneer Butter Masala', oilGrams: 18, servingGrams: 250, category: 'rich_curry', totalCalories: 400, oilCalories: 162 },
  { id: '7', name: 'Chole', oilGrams: 10, servingGrams: 250, category: 'gravy', totalCalories: 280, oilCalories: 90 },
  { id: '8', name: 'Mixed Veg Sabzi', oilGrams: 7, servingGrams: 200, category: 'gravy', totalCalories: 180, oilCalories: 63 },
  
  // Breads
  { id: '9', name: 'Aloo Paratha', oilGrams: 10, servingGrams: 150, category: 'bread', countable: true, totalCalories: 300, oilCalories: 90 },
  { id: '10', name: 'Roti', oilGrams: 1, servingGrams: 30, category: 'bread', countable: true, totalCalories: 80, oilCalories: 9 },
  
  // South Indian
  { id: '11', name: 'Masala Dosa', oilGrams: 12, servingGrams: 250, category: 'south_indian', countable: true, totalCalories: 350, oilCalories: 108 },
  
  // Street Food
  { id: '12', name: 'Vada Pav', oilGrams: 14, servingGrams: 100, category: 'street_food', countable: true, totalCalories: 290, oilCalories: 126 },
  { id: '13', name: 'Pav Bhaji', oilGrams: 20, servingGrams: 250, category: 'street_food', totalCalories: 400, oilCalories: 180 },
  
  // Rice & Vegetables
  { id: '14', name: 'Steamed Rice', oilGrams: 0, servingGrams: 200, category: 'rice', totalCalories: 200, oilCalories: 0 },
  { id: '15', name: 'Boiled Vegetables', oilGrams: 2, servingGrams: 150, category: 'gravy', totalCalories: 100, oilCalories: 18 },
  
  // Tandoori
  { id: '16', name: 'Paneer Tikka', oilGrams: 6, servingGrams: 100, category: 'tandoori', totalCalories: 260, oilCalories: 54 },
];

// Search function
export const searchFood = (query: string): FoodItem[] => {
  if (!query) return foodDatabase;
  const lowercaseQuery = query.toLowerCase();
  return foodDatabase.filter(food => 
    food.name.toLowerCase().includes(lowercaseQuery)
  );
};

// Calculate oil amount based on quantity
export const calculateOilAmount = (food: FoodItem, quantity: number, unit: 'grams' | 'bowls' | 'pieces'): number => {
  let grams = quantity;
  
  if (unit === 'bowls') {
    // 1 bowl = serving size
    grams = quantity * food.servingGrams;
  } else if (unit === 'pieces' && food.countable) {
    // Use serving size per piece
    grams = quantity * food.servingGrams;
  }
  
  // Calculate oil based on proportion of serving size
  const oilPerGram = food.oilGrams / food.servingGrams;
  return grams * oilPerGram;
};
