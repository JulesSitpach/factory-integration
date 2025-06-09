import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { parse as csvParse } from 'csv-parse/sync';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

// Define types for product data
interface ProductData {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  country_of_origin: string;
  hts_code: string;
}

interface CalculationResult {
  id: string;
  summary: {
    total_products: number;
    total_base_cost: number;
    total_tariff_cost: number;
    total_landed_cost: number;
    average_tariff_rate: number;
    highest_tariff_product: string;
    highest_tariff_rate: number;
    potential_savings: number;
  };
  details: Array<{
    product_code: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    country_of_origin: string;
    hts_code: string;
    base_cost: number;
    tariff_rate: number;
    tariff_cost: number;
    landed_cost: number;
    alternative_suppliers?: Array<{
      country: string;
      tariff_rate: number;
      potential_savings: number;
    }>;
  }>;
  created_at: string;
}

// Define validation schema for form data
const formDataSchema = z.object({
  file: z.instanceof(File).optional(),
  products: z.string().optional(),
});

/**
 * Calculate landed costs and tariffs for uploaded purchase orders
 * 
 * This route handles POST requests to:
 * 1. Accept file uploads (CSV, XLSX, PDF) containing purchase orders
 * 2. Parse the uploaded files to extract product information
 * 3. Calculate landed costs and tariffs based on product data
 * 4. Return the calculation results in a structured format
 * 5. Store calculation results in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const auth = await getAuth();
    if (!auth.session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const productsJson = formData.get('products') as string | null;
    
    // Validate form data
    const validationResult = formDataSchema.safeParse({
      file,
      products: productsJson,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Extract products data from either file or JSON
    let products: ProductData[] = [];
    
    if (file) {
      // Handle file upload
      products = await parseFileContents(file);
    } else if (productsJson) {
      // Parse JSON data
      try {
        products = JSON.parse(productsJson);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON format for products' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No file or product data provided' },
        { status: 400 }
      );
    }
    
    // Calculate tariffs and landed costs
    const calculationResult = calculateLandedCosts(products);
    
    // Store calculation in database
    const { data, error } = await supabase
      .from('calculations')
      .insert({
        id: calculationResult.id,
        user_id: auth.session.user.id,
        summary: calculationResult.summary,
        details: calculationResult.details,
        created_at: calculationResult.created_at,
      })
      .select();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to store calculation results' },
        { status: 500 }
      );
    }
    
    // Return calculation results
    return NextResponse.json(calculationResult);
    
  } catch (error) {
    console.error('Cost calculator error:', error);
    return NextResponse.json(
      { error: 'An error occurred during calculation' },
      { status: 500 }
    );
  }
}

/**
 * Parse uploaded file contents based on file type
 * 
 * @param file - Uploaded file (CSV, XLSX, or PDF)
 * @returns Array of parsed product data
 */
async function parseFileContents(file: File): Promise<ProductData[]> {
  const fileType = file.type;
  const buffer = await file.arrayBuffer();
  
  // Parse based on file type
  if (fileType === 'text/csv') {
    return parseCSV(buffer);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             fileType === 'application/vnd.ms-excel') {
    return parseExcel(buffer);
  } else if (fileType === 'application/pdf') {
    return parsePDF(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Parse CSV file contents
 * 
 * @param buffer - ArrayBuffer containing CSV data
 * @returns Array of parsed product data
 */
function parseCSV(buffer: ArrayBuffer): ProductData[] {
  const text = new TextDecoder().decode(buffer);
  const records = csvParse(text, {
    columns: true,
    skip_empty_lines: true,
  });
  
  return records.map((record: any) => ({
    product_code: record.product_code || '',
    product_name: record.product_name || '',
    quantity: parseFloat(record.quantity) || 0,
    unit_price: parseFloat(record.unit_price) || 0,
    country_of_origin: record.country_of_origin || '',
    hts_code: record.hts_code || '',
  }));
}

/**
 * Parse Excel file contents
 * 
 * @param buffer - ArrayBuffer containing Excel data
 * @returns Array of parsed product data
 */
function parseExcel(buffer: ArrayBuffer): ProductData[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map((record: any) => ({
    product_code: record.product_code || '',
    product_name: record.product_name || '',
    quantity: parseFloat(record.quantity) || 0,
    unit_price: parseFloat(record.unit_price) || 0,
    country_of_origin: record.country_of_origin || '',
    hts_code: record.hts_code || '',
  }));
}

/**
 * Parse PDF file contents
 * 
 * @param buffer - ArrayBuffer containing PDF data
 * @returns Array of parsed product data
 */
function parsePDF(buffer: ArrayBuffer): ProductData[] {
  // Note: PDF parsing requires additional libraries like pdf-parse
  // This is a placeholder implementation
  
  // For MVP, we'll return an empty array
  // In a production environment, implement proper PDF parsing
  console.warn('PDF parsing not fully implemented yet');
  return [];
}

/**
 * Calculate landed costs and tariffs for products
 * 
 * @param products - Array of product data
 * @returns Calculation results with summary and details
 */
function calculateLandedCosts(products: ProductData[]): CalculationResult {
  // Get current date/time
  const now = new Date();
  
  // Initialize calculation results
  const details = products.map(product => {
    // Calculate base cost (price * quantity)
    const base_cost = product.unit_price * product.quantity;
    
    // Get tariff rate based on HTS code and country of origin
    // This would typically come from a tariff database
    // For now, using a simple lookup function
    const tariff_rate = getTariffRate(product.hts_code, product.country_of_origin);
    
    // Calculate tariff cost
    const tariff_cost = base_cost * (tariff_rate / 100);
    
    // Calculate landed cost (base cost + tariff cost)
    const landed_cost = base_cost + tariff_cost;
    
    // Generate alternative supplier suggestions
    const alternative_suppliers = getAlternativeSuppliers(product.hts_code, product.country_of_origin);
    
    return {
      product_code: product.product_code,
      product_name: product.product_name,
      quantity: product.quantity,
      unit_price: product.unit_price,
      country_of_origin: product.country_of_origin,
      hts_code: product.hts_code,
      base_cost,
      tariff_rate,
      tariff_cost,
      landed_cost,
      alternative_suppliers,
    };
  });
  
  // Calculate summary statistics
  const total_products = details.length;
  const total_base_cost = details.reduce((sum, item) => sum + item.base_cost, 0);
  const total_tariff_cost = details.reduce((sum, item) => sum + item.tariff_cost, 0);
  const total_landed_cost = details.reduce((sum, item) => sum + item.landed_cost, 0);
  
  // Find highest tariff product
  const highestTariffItem = details.reduce(
    (highest, current) => (current.tariff_rate > highest.tariff_rate ? current : highest),
    details[0] || { product_name: '', tariff_rate: 0 }
  );
  
  // Calculate average tariff rate
  const average_tariff_rate = total_base_cost > 0 
    ? (total_tariff_cost / total_base_cost) * 100 
    : 0;
  
  // Calculate potential savings (sum of best alternative supplier savings)
  const potential_savings = details.reduce((sum, item) => {
    if (item.alternative_suppliers && item.alternative_suppliers.length > 0) {
      // Find best alternative (highest savings)
      const bestAlternative = item.alternative_suppliers.reduce(
        (best, current) => (current.potential_savings > best.potential_savings ? current : best),
        item.alternative_suppliers[0]
      );
      return sum + bestAlternative.potential_savings;
    }
    return sum;
  }, 0);
  
  return {
    id: uuidv4(),
    summary: {
      total_products,
      total_base_cost,
      total_tariff_cost,
      total_landed_cost,
      average_tariff_rate,
      highest_tariff_product: highestTariffItem.product_name,
      highest_tariff_rate: highestTariffItem.tariff_rate,
      potential_savings,
    },
    details,
    created_at: now.toISOString(),
  };
}

/**
 * Get tariff rate for a given HTS code and country of origin
 * 
 * @param htsCode - Harmonized Tariff Schedule code
 * @param countryOfOrigin - Country of origin
 * @returns Tariff rate percentage
 */
function getTariffRate(htsCode: string, countryOfOrigin: string): number {
  // This is a simplified implementation
  // In a production environment, this would query a tariff database
  
  // Sample tariff rates for demonstration
  const tariffRates: Record<string, Record<string, number>> = {
    // Electronics
    '8471': { 'China': 25, 'Vietnam': 0, 'Mexico': 0, 'Japan': 0 },
    '8517': { 'China': 15, 'Vietnam': 0, 'South Korea': 0, 'Japan': 0 },
    
    // Textiles
    '6110': { 'China': 10, 'Bangladesh': 0, 'Vietnam': 0, 'India': 5 },
    '6204': { 'China': 7.5, 'Bangladesh': 0, 'Vietnam': 0, 'India': 2.5 },
    
    // Furniture
    '9403': { 'China': 25, 'Vietnam': 0, 'Malaysia': 0, 'Mexico': 0 },
    
    // Default
    'default': { 'China': 7.5, 'default': 0 },
  };
  
  // Get first 4 digits of HTS code for category matching
  const category = htsCode.substring(0, 4);
  
  // Look up tariff rate
  if (tariffRates[category]) {
    if (tariffRates[category][countryOfOrigin]) {
      return tariffRates[category][countryOfOrigin];
    }
    return tariffRates[category]['default'] || tariffRates['default']['default'];
  }
  
  // Default China tariff
  if (countryOfOrigin === 'China') {
    return tariffRates['default']['China'];
  }
  
  // Default tariff
  return tariffRates['default']['default'];
}

/**
 * Get alternative suppliers for a given HTS code and country of origin
 * 
 * @param htsCode - Harmonized Tariff Schedule code
 * @param countryOfOrigin - Country of origin
 * @returns Array of alternative suppliers with potential savings
 */
function getAlternativeSuppliers(htsCode: string, countryOfOrigin: string) {
  // This is a simplified implementation
  // In a production environment, this would query a supplier database
  
  // Sample alternative suppliers for demonstration
  const alternativeSuppliers: Record<string, Array<{ country: string, tariff_rate: number }>> = {
    // Electronics
    '8471': [
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'Mexico', tariff_rate: 0 },
      { country: 'Malaysia', tariff_rate: 0 },
    ],
    '8517': [
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'South Korea', tariff_rate: 0 },
      { country: 'Taiwan', tariff_rate: 5 },
    ],
    
    // Textiles
    '6110': [
      { country: 'Bangladesh', tariff_rate: 0 },
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'Cambodia', tariff_rate: 0 },
    ],
    '6204': [
      { country: 'Bangladesh', tariff_rate: 0 },
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'Indonesia', tariff_rate: 2.5 },
    ],
    
    // Furniture
    '9403': [
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'Malaysia', tariff_rate: 0 },
      { country: 'Mexico', tariff_rate: 0 },
    ],
    
    // Default alternatives
    'default': [
      { country: 'Vietnam', tariff_rate: 0 },
      { country: 'Mexico', tariff_rate: 0 },
      { country: 'India', tariff_rate: 2.5 },
    ],
  };
  
  // Get first 4 digits of HTS code for category matching
  const category = htsCode.substring(0, 4);
  
  // Get current tariff rate
  const currentTariffRate = getTariffRate(htsCode, countryOfOrigin);
  
  // Get alternatives
  const alternatives = alternativeSuppliers[category] || alternativeSuppliers['default'];
  
  // Filter out current country and calculate potential savings
  return alternatives
    .filter(supplier => supplier.country !== countryOfOrigin)
    .map(supplier => ({
      country: supplier.country,
      tariff_rate: supplier.tariff_rate,
      potential_savings: Math.max(0, currentTariffRate - supplier.tariff_rate),
    }));
}
