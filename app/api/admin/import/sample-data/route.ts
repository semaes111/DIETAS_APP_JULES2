import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'foods-csv':
        const foodsCSV = `name,brand,category,serving_size,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,fiber_per_100g,sugar_per_100g,sodium_per_100g
Chicken Breast,Generic,Protein,100,165,31,0,3.6,0,0,74
Salmon Fillet,Fresh,Protein,100,208,25,0,12,0,0,59
Ground Beef 90/10,Generic,Protein,100,176,20,0,10,0,0,75
Brown Rice,Whole Grain,Grains,100,111,2.6,23,0.9,1.8,0.4,5
Quinoa,Organic,Grains,100,120,4.4,22,1.9,2.8,0.9,5
Sweet Potato,Fresh,Vegetables,100,86,1.6,20,0.1,3,4.2,9
Broccoli,Fresh,Vegetables,100,34,2.8,7,0.4,2.6,1.5,33
Spinach,Fresh,Leafy Greens,100,23,2.9,3.6,0.4,2.2,0.4,79
Banana,Fresh,Fruits,100,89,1.1,23,0.3,2.6,12,1
Apple,Red Delicious,Fruits,100,52,0.3,14,0.2,2.4,10,1
Blueberries,Fresh,Fruits,100,57,0.7,14,0.3,2.4,10,1
Avocado,Fresh,Fats,100,160,2,9,15,7,0.7,7
Olive Oil,Extra Virgin,Fats,100,884,0,0,100,0,0,2
Almonds,Raw,Nuts,100,579,21,22,50,12,4.3,1
Greek Yogurt,Plain,Dairy,100,59,10,3.6,0.4,0,3.6,36
Cottage Cheese,Low Fat,Dairy,100,98,11,3.4,4.3,0,3.4,364
Eggs,Large,Protein,100,155,13,1.1,11,0,0.6,124
Oats,Rolled,Grains,100,389,17,66,7,11,1,2
Black Beans,Cooked,Legumes,100,132,8.9,24,0.5,8.7,0.3,2
Lentils,Red,Legumes,100,116,9,20,0.4,8,1.8,2`

        return new NextResponse(foodsCSV, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=sample_foods_comprehensive.csv'
          }
        })

      case 'recipes-json':
        const recipesJSON = [
          {
            name: "Grilled Chicken with Quinoa and Broccoli",
            description: "A balanced, protein-rich meal perfect for lunch or dinner",
            instructions: "1. Season chicken breast with salt, pepper, and herbs\n2. Grill chicken for 6-7 minutes per side until cooked through\n3. Cook quinoa according to package instructions\n4. Steam broccoli for 5-7 minutes until tender\n5. Let chicken rest for 5 minutes, then slice\n6. Serve chicken over quinoa with broccoli on the side\n7. Drizzle with olive oil and lemon juice",
            servings: 2,
            prepTime: 15,
            cookTime: 20,
            difficulty: "Easy",
            category: "Main Course",
            ingredients: [
              { foodName: "Chicken Breast", quantity: 200, notes: "boneless, skinless" },
              { foodName: "Quinoa", quantity: 100, notes: "dry weight" },
              { foodName: "Broccoli", quantity: 150, notes: "fresh florets" },
              { foodName: "Olive Oil", quantity: 10, notes: "extra virgin" }
            ]
          },
          {
            name: "Salmon and Sweet Potato Bowl",
            description: "Omega-3 rich salmon with roasted sweet potato and spinach",
            instructions: "1. Preheat oven to 400°F (200°C)\n2. Cut sweet potato into cubes and roast for 25 minutes\n3. Season salmon with lemon, salt, and pepper\n4. Pan-sear salmon for 4-5 minutes per side\n5. Sauté spinach with garlic until wilted\n6. Combine all ingredients in a bowl\n7. Garnish with lemon and serve",
            servings: 1,
            prepTime: 10,
            cookTime: 30,
            difficulty: "Medium",
            category: "Main Course",
            ingredients: [
              { foodName: "Salmon Fillet", quantity: 150, notes: "skin-on" },
              { foodName: "Sweet Potato", quantity: 200, notes: "medium sized" },
              { foodName: "Spinach", quantity: 100, notes: "fresh leaves" },
              { foodName: "Olive Oil", quantity: 15, notes: "for cooking" }
            ]
          },
          {
            name: "Greek Yogurt Berry Parfait",
            description: "High-protein breakfast or snack with antioxidant-rich berries",
            instructions: "1. Layer Greek yogurt in a glass or bowl\n2. Add a layer of fresh blueberries\n3. Sprinkle crushed almonds on top\n4. Add another layer of yogurt\n5. Top with more berries and almonds\n6. Serve immediately",
            servings: 1,
            prepTime: 5,
            cookTime: 0,
            difficulty: "Easy",
            category: "Breakfast",
            ingredients: [
              { foodName: "Greek Yogurt", quantity: 150, notes: "plain, low-fat" },
              { foodName: "Blueberries", quantity: 80, notes: "fresh or frozen" },
              { foodName: "Almonds", quantity: 15, notes: "crushed or sliced" }
            ]
          },
          {
            name: "Vegetarian Lentil Stir Fry",
            description: "Plant-based protein bowl with colorful vegetables",
            instructions: "1. Cook lentils according to package instructions\n2. Heat oil in a large pan or wok\n3. Add diced sweet potato and cook for 10 minutes\n4. Add broccoli and cook for 5 minutes\n5. Add spinach and cooked lentils\n6. Season with herbs and spices\n7. Cook for 2-3 minutes until heated through",
            servings: 3,
            prepTime: 15,
            cookTime: 25,
            difficulty: "Easy",
            category: "Vegetarian",
            ingredients: [
              { foodName: "Lentils", quantity: 200, notes: "dry weight, red or green" },
              { foodName: "Sweet Potato", quantity: 250, notes: "diced" },
              { foodName: "Broccoli", quantity: 200, notes: "cut into florets" },
              { foodName: "Spinach", quantity: 100, notes: "fresh" },
              { foodName: "Olive Oil", quantity: 20, notes: "for cooking" }
            ]
          },
          {
            name: "Overnight Oats with Banana and Almonds",
            description: "Make-ahead breakfast that's ready when you wake up",
            instructions: "1. Combine oats and Greek yogurt in a jar\n2. Mash half the banana and mix in\n3. Add a splash of water or milk if needed\n4. Refrigerate overnight\n5. In the morning, top with sliced banana and almonds\n6. Enjoy cold or warm briefly in microwave",
            servings: 1,
            prepTime: 5,
            cookTime: 0,
            difficulty: "Easy",
            category: "Breakfast",
            ingredients: [
              { foodName: "Oats", quantity: 40, notes: "rolled oats" },
              { foodName: "Greek Yogurt", quantity: 100, notes: "plain" },
              { foodName: "Banana", quantity: 120, notes: "medium sized" },
              { foodName: "Almonds", quantity: 10, notes: "sliced" }
            ]
          }
        ]

        return NextResponse.json(recipesJSON, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=sample_recipes_comprehensive.json'
          }
        })

      case 'meal-plans-json':
        const mealPlansJSON = [
          {
            name: "Healthy Week - High Protein",
            startDate: "2024-01-01",
            endDate: "2024-01-07",
            meals: [
              {
                date: "2024-01-01",
                type: "BREAKFAST",
                name: "Greek Yogurt Parfait",
                foods: [
                  { foodName: "Greek Yogurt", quantity: 150 },
                  { foodName: "Blueberries", quantity: 80 },
                  { foodName: "Almonds", quantity: 15 }
                ]
              },
              {
                date: "2024-01-01",
                type: "LUNCH",
                name: "Grilled Chicken Quinoa Bowl",
                foods: [
                  { foodName: "Chicken Breast", quantity: 150 },
                  { foodName: "Quinoa", quantity: 80 },
                  { foodName: "Broccoli", quantity: 100 },
                  { foodName: "Olive Oil", quantity: 10 }
                ]
              },
              {
                date: "2024-01-01",
                type: "DINNER",
                name: "Salmon Sweet Potato Bowl",
                foods: [
                  { foodName: "Salmon Fillet", quantity: 150 },
                  { foodName: "Sweet Potato", quantity: 200 },
                  { foodName: "Spinach", quantity: 100 }
                ]
              },
              {
                date: "2024-01-01",
                type: "SNACK",
                name: "Apple with Almonds",
                foods: [
                  { foodName: "Apple", quantity: 150 },
                  { foodName: "Almonds", quantity: 20 }
                ]
              },
              {
                date: "2024-01-02",
                type: "BREAKFAST",
                name: "Overnight Oats",
                foods: [
                  { foodName: "Oats", quantity: 40 },
                  { foodName: "Greek Yogurt", quantity: 100 },
                  { foodName: "Banana", quantity: 120 }
                ]
              },
              {
                date: "2024-01-02",
                type: "LUNCH",
                name: "Lentil Vegetable Stir Fry",
                foods: [
                  { foodName: "Lentils", quantity: 150 },
                  { foodName: "Sweet Potato", quantity: 200 },
                  { foodName: "Broccoli", quantity: 150 },
                  { foodName: "Spinach", quantity: 50 },
                  { foodName: "Olive Oil", quantity: 15 }
                ]
              },
              {
                date: "2024-01-02",
                type: "DINNER",
                name: "Lean Beef with Brown Rice",
                foods: [
                  { foodName: "Ground Beef 90/10", quantity: 120 },
                  { foodName: "Brown Rice", quantity: 100 },
                  { foodName: "Broccoli", quantity: 150 }
                ]
              }
            ]
          },
          {
            name: "Vegetarian Week",
            startDate: "2024-01-08",
            endDate: "2024-01-14",
            meals: [
              {
                date: "2024-01-08",
                type: "BREAKFAST",
                name: "Protein Oats Bowl",
                foods: [
                  { foodName: "Oats", quantity: 50 },
                  { foodName: "Greek Yogurt", quantity: 120 },
                  { foodName: "Blueberries", quantity: 100 },
                  { foodName: "Almonds", quantity: 20 }
                ]
              },
              {
                date: "2024-01-08",
                type: "LUNCH",
                name: "Quinoa Power Bowl",
                foods: [
                  { foodName: "Quinoa", quantity: 100 },
                  { foodName: "Black Beans", quantity: 150 },
                  { foodName: "Sweet Potato", quantity: 150 },
                  { foodName: "Spinach", quantity: 100 },
                  { foodName: "Avocado", quantity: 50 }
                ]
              },
              {
                date: "2024-01-08",
                type: "DINNER",
                name: "Lentil Curry Bowl",
                foods: [
                  { foodName: "Lentils", quantity: 180 },
                  { foodName: "Brown Rice", quantity: 80 },
                  { foodName: "Spinach", quantity: 100 },
                  { foodName: "Olive Oil", quantity: 10 }
                ]
              }
            ]
          }
        ]

        return NextResponse.json(mealPlansJSON, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=sample_meal_plans_comprehensive.json'
          }
        })

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid sample data type' },
          { status: 400 }
        )
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to generate sample data' },
      { status: 500 }
    )
  }
}