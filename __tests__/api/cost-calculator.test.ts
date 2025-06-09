import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/cost-calculator/route';
import * as auth from '@/lib/auth';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// Mock file parsing modules
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {},
    },
  })),
  utils: {
    sheet_to_json: jest.fn(() => [
      {
        product_code: 'PROD-001',
        product_name: 'Test Product',
        quantity: '10',
        unit_price: '100',
        country_of_origin: 'China',
        hts_code: '8471',
      },
    ]),
  },
}));

jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(() => [
    {
      product_code: 'PROD-001',
      product_name: 'Test Product',
      quantity: '10',
      unit_price: '100',
      country_of_origin: 'China',
      hts_code: '8471',
    },
  ]),
}));

// Sample test data
const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
};

const mockProductData = [
  {
    product_code: 'PROD-001',
    product_name: 'Test Product',
    quantity: 10,
    unit_price: 100,
    country_of_origin: 'China',
    hts_code: '8471',
  },
];

const mockCalculationResult = {
  id: 'test-uuid-1234',
  summary: {
    total_products: 1,
    total_base_cost: 1000,
    total_tariff_cost: 250,
    total_landed_cost: 1250,
    average_tariff_rate: 25,
    highest_tariff_product: 'Test Product',
    highest_tariff_rate: 25,
    potential_savings: 250,
  },
  details: [
    {
      product_code: 'PROD-001',
      product_name: 'Test Product',
      quantity: 10,
      unit_price: 100,
      country_of_origin: 'China',
      hts_code: '8471',
      base_cost: 1000,
      tariff_rate: 25,
      tariff_cost: 250,
      landed_cost: 1250,
      alternative_suppliers: [
        {
          country: 'Vietnam',
          tariff_rate: 0,
          potential_savings: 25,
        },
      ],
    },
  ],
  created_at: expect.any(String),
};

// Helper to create mock file
function createMockFile(content: string, name: string, type: string): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

// Helper to create mock request
function createMockRequest(body: FormData): NextRequest {
  return {
    formData: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('Cost Calculator API', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated session
    (auth.getAuth as jest.Mock).mockResolvedValue({
      session: mockSession,
      user: mockSession.user,
      error: null,
      isAuthenticated: true,
    });
    
    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [mockCalculationResult],
        error: null,
      }),
    };
    
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    
    // Mock NextResponse.json
    jest.spyOn(NextResponse, 'json').mockImplementation((body) => {
      return {
        status: 200,
        body,
      } as unknown as NextResponse;
    });
  });

  describe('Authentication checks', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated state
      (auth.getAuth as jest.Mock).mockResolvedValue({
        session: null,
        user: null,
        error: null,
        isAuthenticated: false,
      });
      
      const formData = new FormData();
      formData.append('products', JSON.stringify(mockProductData));
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(response).toHaveProperty('status', 401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });
  });

  describe('File upload functionality', () => {
    it('should process CSV file uploads correctly', async () => {
      const csvContent = 'product_code,product_name,quantity,unit_price,country_of_origin,hts_code\nPROD-001,Test Product,10,100,China,8471';
      const csvFile = createMockFile(csvContent, 'test.csv', 'text/csv');
      
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calculations');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        summary: expect.any(Object),
        details: expect.any(Array),
      }));
    });
    
    it('should process Excel file uploads correctly', async () => {
      const excelFile = createMockFile('dummy content', 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      const formData = new FormData();
      formData.append('file', excelFile);
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calculations');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        summary: expect.any(Object),
        details: expect.any(Array),
      }));
    });
    
    it('should handle PDF file uploads (even if parsing is limited)', async () => {
      const pdfFile = createMockFile('dummy pdf content', 'test.pdf', 'application/pdf');
      
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      // Even with empty results from PDF parsing, it should process without error
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calculations');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });
  });

  describe('Processing of JSON data', () => {
    it('should process product data sent as JSON', async () => {
      const formData = new FormData();
      formData.append('products', JSON.stringify(mockProductData));
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calculations');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        summary: expect.objectContaining({
          total_products: expect.any(Number),
          total_base_cost: expect.any(Number),
          total_tariff_cost: expect.any(Number),
          total_landed_cost: expect.any(Number),
        }),
        details: expect.arrayContaining([
          expect.objectContaining({
            product_code: expect.any(String),
            product_name: expect.any(String),
            tariff_rate: expect.any(Number),
            landed_cost: expect.any(Number),
          }),
        ]),
      }));
    });
  });

  describe('Error handling for invalid inputs', () => {
    it('should return 400 if no file or product data is provided', async () => {
      const formData = new FormData();
      // No data appended
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'No file or product data provided' },
        { status: 400 }
      );
    });
    
    it('should return 400 if JSON data is malformed', async () => {
      const formData = new FormData();
      formData.append('products', 'invalid-json-data');
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(response).toHaveProperty('status', 400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid JSON format for products' },
        { status: 400 }
      );
    });
    
    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });
      
      const formData = new FormData();
      formData.append('products', JSON.stringify(mockProductData));
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      expect(response).toHaveProperty('status', 500);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to store calculation results' },
        { status: 500 }
      );
    });
  });

  describe('Response format validation', () => {
    it('should return calculation results in the expected format', async () => {
      const formData = new FormData();
      formData.append('products', JSON.stringify(mockProductData));
      
      const request = createMockRequest(formData);
      const response = await POST(request);
      
      // Validate response structure
      expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        summary: expect.objectContaining({
          total_products: expect.any(Number),
          total_base_cost: expect.any(Number),
          total_tariff_cost: expect.any(Number),
          total_landed_cost: expect.any(Number),
          average_tariff_rate: expect.any(Number),
          highest_tariff_product: expect.any(String),
          highest_tariff_rate: expect.any(Number),
          potential_savings: expect.any(Number),
        }),
        details: expect.arrayContaining([
          expect.objectContaining({
            product_code: expect.any(String),
            product_name: expect.any(String),
            quantity: expect.any(Number),
            unit_price: expect.any(Number),
            country_of_origin: expect.any(String),
            hts_code: expect.any(String),
            base_cost: expect.any(Number),
            tariff_rate: expect.any(Number),
            tariff_cost: expect.any(Number),
            landed_cost: expect.any(Number),
            alternative_suppliers: expect.arrayContaining([
              expect.objectContaining({
                country: expect.any(String),
                tariff_rate: expect.any(Number),
                potential_savings: expect.any(Number),
              }),
            ]),
          }),
        ]),
        created_at: expect.any(String),
      }));
    });
  });
});
