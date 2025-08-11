# Data Import System - User Guide

## Overview

The DIETAS-APP now includes a comprehensive data import system that allows administrators to bulk import nutrition data, recipes, and meal plans from CSV and JSON files. This system is designed to handle data from various sources including exported files from Google Drive.

## Setup Instructions

### 1. Database Migration

First, update your database to include the new admin functionality:

```bash
npx prisma db push
```

This will add the `isAdmin` field to the User table.

### 2. Install Dependencies

Install the required new dependencies:

```bash
npm install papaparse @types/papaparse
```

### 3. Make a User Admin

To access the admin panel, you need to make at least one user an administrator:

```bash
node scripts/make-admin.js your-email@example.com
```

Replace `your-email@example.com` with the email of the user account you want to make an admin.

## Accessing the Admin Panel

1. Sign in to your account (the one you made admin)
2. Navigate to `/admin/import` in your browser
3. You should see the Data Import Administration panel

## Importing Data

### Foods Data (CSV Format)

**Supported Formats:**
- CSV files with headers
- Maximum file size: 10MB

**Required Columns:**
- `name` - Food name (text)
- `category` - Food category (text)
- `calories_per_100g` - Calories per 100g (number)
- `protein_per_100g` - Protein per 100g (number)
- `carbs_per_100g` - Carbohydrates per 100g (number)
- `fat_per_100g` - Fat per 100g (number)

**Optional Columns:**
- `brand` - Brand name
- `barcode` - Product barcode
- `description` - Food description
- `serving_size` - Default serving size in grams (defaults to 100)
- `fiber_per_100g` - Fiber per 100g
- `sugar_per_100g` - Sugar per 100g
- `sodium_per_100g` - Sodium per 100g

**Example CSV Structure:**
```csv
name,brand,category,serving_size,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,fiber_per_100g,sugar_per_100g,sodium_per_100g
Chicken Breast,Generic,Protein,100,165,31,0,3.6,0,0,74
Brown Rice,Whole Grain,Grains,100,111,2.6,23,0.9,1.8,0.4,5
```

### Recipes Data (JSON Format)

**Supported Formats:**
- JSON files containing arrays of recipe objects
- Maximum file size: 10MB

**Required Fields:**
- `name` - Recipe name
- `instructions` - Cooking instructions
- `servings` - Number of servings

**Optional Fields:**
- `description` - Recipe description
- `prepTime` - Preparation time in minutes
- `cookTime` - Cooking time in minutes
- `difficulty` - Difficulty level
- `category` - Recipe category
- `image` - Image URL
- `ingredients` - Array of ingredient objects with:
  - `foodName` - Name of the food ingredient
  - `quantity` - Quantity in grams
  - `notes` - Optional notes

**Example JSON Structure:**
```json
[
  {
    "name": "Grilled Chicken Salad",
    "description": "A healthy and nutritious grilled chicken salad",
    "instructions": "1. Season chicken breast...\n2. Grill chicken...",
    "servings": 2,
    "prepTime": 15,
    "cookTime": 15,
    "difficulty": "Easy",
    "category": "Main Course",
    "ingredients": [
      {
        "foodName": "Chicken Breast",
        "quantity": 200,
        "notes": "boneless, skinless"
      }
    ]
  }
]
```

### Meal Plans Data (JSON Format)

**Supported Formats:**
- JSON files containing arrays of meal plan objects
- Maximum file size: 10MB

**Required Fields:**
- `name` - Meal plan name
- `startDate` - Start date (YYYY-MM-DD format)
- `endDate` - End date (YYYY-MM-DD format)
- `meals` - Array of meal objects

**Meal Object Structure:**
- `date` - Meal date (YYYY-MM-DD format)
- `type` - Meal type (BREAKFAST, LUNCH, DINNER, SNACK)
- `name` - Optional meal name
- `foods` - Array of food objects with:
  - `foodName` - Name of the food
  - `quantity` - Quantity in grams

**Example JSON Structure:**
```json
[
  {
    "name": "Weekly Healthy Meal Plan",
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "meals": [
      {
        "date": "2024-01-01",
        "type": "BREAKFAST",
        "name": "Morning Energy Bowl",
        "foods": [
          {
            "foodName": "Banana",
            "quantity": 120
          },
          {
            "foodName": "Greek Yogurt",
            "quantity": 150
          }
        ]
      }
    ]
  }
]
```

## Downloading Sample Files

The admin interface provides sample files for each data type:

1. **Sample Foods CSV** - Click the download button next to "Import Foods"
2. **Sample Recipes JSON** - Click the download button next to "Import Recipes"  
3. **Sample Meal Plans JSON** - Click the download button next to "Import Meal Plans"

These samples contain comprehensive examples with all supported fields.

## Working with Google Drive Data

If you have nutrition data stored in Google Drive:

### Option 1: Download and Convert
1. Download your files from Google Drive to your local machine
2. If the data is in Google Sheets format, export as CSV
3. If you have structured data in Docs or other formats, convert to the required JSON/CSV format
4. Use the admin interface to upload the converted files

### Option 2: Manual Data Entry Using Samples
1. Download the sample files from the admin interface
2. Use them as templates to structure your Google Drive data
3. Copy and paste your data into the sample format
4. Upload through the admin interface

## Data Validation and Error Handling

The import system includes comprehensive validation:

- **File Type Validation**: Only accepts CSV files for foods, JSON files for recipes and meal plans
- **Size Limits**: Maximum 10MB per file
- **Data Validation**: Checks for required fields and valid data types
- **Error Reporting**: Detailed error messages for invalid records
- **Partial Success**: Successfully imports valid records even if some fail

## Import Process Flow

1. **File Upload**: Select and upload your data file
2. **Validation**: System validates file format and data structure
3. **Processing**: Valid records are processed and imported
4. **Results**: View detailed results including:
   - Number of records processed
   - Success/failure status
   - Detailed error messages for failed records
   - Updated database statistics

## Database Management

### Viewing Statistics
The admin panel displays current database statistics:
- Total foods in database
- Total recipes in database  
- Total meal plans in database
- Total users in system

### Clearing Data (Danger Zone)
The system includes a "Clear All Data" function for testing purposes:
- **WARNING**: This permanently deletes ALL application data
- Requires confirmation with the text "CLEAR_ALL_DATA"
- Use only for testing or when starting fresh
- Cannot be undone

## Troubleshooting Common Issues

### "Admin access required" Error
- Ensure your user account has been made an admin using the script
- Sign out and sign back in after being made an admin

### CSV Parsing Errors
- Ensure your CSV has proper headers
- Check for special characters or encoding issues
- Verify numeric fields contain valid numbers

### Food Matching Issues (Recipes/Meal Plans)
- Recipe ingredients and meal plan foods are matched by name
- Food must exist in the database before importing recipes/meal plans
- Import foods first, then recipes and meal plans

### Large File Issues
- Split large files into smaller chunks (under 10MB each)
- Remove unnecessary columns from CSV files
- Consider importing in batches

## Best Practices

1. **Import Order**: Always import Foods first, then Recipes, then Meal Plans
2. **Data Backup**: Keep backups of your original data files
3. **Test with Samples**: Start with sample files to understand the format
4. **Batch Processing**: Import data in manageable batches
5. **Validation**: Review import results and error messages carefully

## Support

If you encounter issues:
1. Check the error messages in the import results
2. Verify your data format matches the examples
3. Ensure you have admin privileges
4. Check that required dependencies are installed

## Technical Details

### File Processing
- CSV files are parsed using PapaParse library
- JSON files are parsed with native JSON.parse
- All imports use database transactions for data integrity

### Security
- Admin authentication required for all import operations
- File type and size validation
- Input sanitization and validation
- SQL injection prevention through Prisma ORM

### Performance
- Bulk insert operations for efficiency
- Transaction-based imports for data integrity
- Progress indicators for user feedback
- Error handling to prevent system crashes