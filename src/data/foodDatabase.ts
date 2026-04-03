// Food Database with Oil Content based on research data
// Format: { name, oilGrams, servingGrams, category }

export interface FoodItem {
  id: string;
  name: string;
  oilGrams: number; // grams of oil per serving
  servingGrams: number; // serving size in grams
  category: 'deep_fried' | 'rich_curry' | 'gravy' | 'dal' | 'rice' | 'bread' | 'south_indian' | 'tandoori' | 'street_food';
  countable?: boolean; // like samosa, paratha
}

export const foodDatabase: FoodItem[] = [
  // Deep Fried Items (High Oil)
  { id: '1', name: 'Samosa', oilGrams: 15, servingGrams: 60, category: 'deep_fried', countable: true },
  { id: '2', name: 'Pakora', oilGrams: 16, servingGrams: 80, category: 'deep_fried' },
  { id: '3', name: 'Poori', oilGrams: 10, servingGrams: 40, category: 'deep_fried', countable: true },
  { id: '4', name: 'Bhatura', oilGrams: 12, servingGrams: 80, category: 'deep_fried', countable: true },
  { id: '5', name: 'Vada', oilGrams: 12, servingGrams: 50, category: 'deep_fried', countable: true },
  { id: '6', name: 'Kachori', oilGrams: 14, servingGrams: 60, category: 'deep_fried', countable: true },
  
  // Rich Curries (High Oil)
  { id: '7', name: 'Butter Chicken', oilGrams: 24, servingGrams: 250, category: 'rich_curry' },
  { id: '8', name: 'Paneer Butter Masala', oilGrams: 22, servingGrams: 200, category: 'rich_curry' },
  { id: '9', name: 'Malai Kofta', oilGrams: 25, servingGrams: 200, category: 'rich_curry' },
  { id: '10', name: 'Korma', oilGrams: 23, servingGrams: 250, category: 'rich_curry' },
  { id: '11', name: 'Shahi Paneer', oilGrams: 21, servingGrams: 200, category: 'rich_curry' },
  
  // Medium Oil Curries
  { id: '12', name: 'Palak Paneer', oilGrams: 15, servingGrams: 180, category: 'gravy' },
  { id: '13', name: 'Chole', oilGrams: 12, servingGrams: 200, category: 'gravy' },
  { id: '14', name: 'Rajma', oilGrams: 11, servingGrams: 200, category: 'gravy' },
  { id: '15', name: 'Kadai Paneer', oilGrams: 16, servingGrams: 200, category: 'gravy' },
  { id: '16', name: 'Bhindi Masala', oilGrams: 13, servingGrams: 200, category: 'gravy' },
  { id: '17', name: 'Aloo Matar', oilGrams: 10, servingGrams: 150, category: 'gravy' },
  { id: '18', name: 'Baingan Bharta', oilGrams: 14, servingGrams: 180, category: 'gravy' },
  
  // Dal (Light Oil)
  { id: '19', name: 'Dal Tadka', oilGrams: 10, servingGrams: 200, category: 'dal' },
  { id: '20', name: 'Dal Fry', oilGrams: 11, servingGrams: 200, category: 'dal' },
  { id: '21', name: 'Dal Makhani', oilGrams: 14, servingGrams: 200, category: 'dal' },
  { id: '22', name: 'Sambhar', oilGrams: 8, servingGrams: 200, category: 'dal' },
  
  // Rice Dishes
  { id: '23', name: 'Biryani', oilGrams: 18, servingGrams: 350, category: 'rice' },
  { id: '24', name: 'Pulao', oilGrams: 12, servingGrams: 300, category: 'rice' },
  { id: '25', name: 'Fried Rice', oilGrams: 14, servingGrams: 300, category: 'rice' },
  { id: '26', name: 'Jeera Rice', oilGrams: 8, servingGrams: 250, category: 'rice' },
  
  // Breads
  { id: '27', name: 'Naan', oilGrams: 6, servingGrams: 80, category: 'bread', countable: true },
  { id: '28', name: 'Roti', oilGrams: 2, servingGrams: 40, category: 'bread', countable: true },
  { id: '29', name: 'Chapati', oilGrams: 2, servingGrams: 40, category: 'bread', countable: true },
  { id: '30', name: 'Paratha', oilGrams: 8, servingGrams: 60, category: 'bread', countable: true },
  { id: '31', name: 'Aloo Paratha', oilGrams: 12, servingGrams: 150, category: 'bread', countable: true },
  { id: '32', name: 'Kulcha', oilGrams: 6, servingGrams: 80, category: 'bread', countable: true },
  
  // South Indian
  { id: '33', name: 'Dosa', oilGrams: 5, servingGrams: 120, category: 'south_indian', countable: true },
  { id: '34', name: 'Masala Dosa', oilGrams: 9, servingGrams: 200, category: 'south_indian', countable: true },
  { id: '35', name: 'Idli', oilGrams: 1, servingGrams: 50, category: 'south_indian', countable: true },
  { id: '36', name: 'Uttapam', oilGrams: 6, servingGrams: 150, category: 'south_indian', countable: true },
  
  // Tandoori/Grilled (Low Oil)
  { id: '37', name: 'Tandoori Chicken', oilGrams: 8, servingGrams: 220, category: 'tandoori' },
  { id: '38', name: 'Paneer Tikka', oilGrams: 9, servingGrams: 150, category: 'tandoori' },
  { id: '39', name: 'Chicken Tikka', oilGrams: 8, servingGrams: 180, category: 'tandoori' },
  
  // Street Food
  { id: '40', name: 'Pav Bhaji', oilGrams: 16, servingGrams: 250, category: 'street_food' },
  { id: '41', name: 'Vada Pav', oilGrams: 12, servingGrams: 100, category: 'street_food', countable: true },
  { id: '42', name: 'Dabeli', oilGrams: 10, servingGrams: 100, category: 'street_food', countable: true },
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
