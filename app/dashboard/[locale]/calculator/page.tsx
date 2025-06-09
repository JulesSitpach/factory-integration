'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the form schema with Zod
const calculatorSchema = z.object({
  productName: z.string().min(1, { message: 'Product name is required' }),
  htsCode: z.string().min(6, { message: 'Valid HTS code is required' }),
  countryOfOrigin: z.string().min(2, { message: 'Country of origin is required' }),
  unitPrice: z.number().positive({ message: 'Price must be greater than 0' }),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  shippingCost: z.number().nonnegative({ message: 'Shipping cost cannot be negative' }),
  insuranceCost: z.number().nonnegative({ message: 'Insurance cost cannot be negative' }),
  additionalFees: z.number().nonnegative({ message: 'Additional fees cannot be negative' }),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

// Translations for the calculator page
const translations = {
  en: {
    // Page title and description
    title: 'Emergency Cost Calculator',
    subtitle: 'Calculate landed costs and tariffs for your imports',
    description: 'Upload purchase orders or enter product details to instantly calculate tariffs, duties, and total landed costs.',
    
    // Form labels
    productDetails: 'Product Details',
    productName: 'Product Name',
    productNamePlaceholder: 'Enter product name',
    htsCode: 'HTS Code',
    htsCodePlaceholder: 'e.g., 8544.42',
    htsCodeHelp: 'Harmonized Tariff Schedule code for your product',
    findHtsCode: 'Find HTS Code',
    countryOfOrigin: 'Country of Origin',
    selectCountry: 'Select country',
    pricing: 'Pricing & Quantity',
    unitPrice: 'Unit Price (USD)',
    quantity: 'Quantity',
    additionalCosts: 'Additional Costs',
    shippingCost: 'Shipping Cost (USD)',
    insuranceCost: 'Insurance Cost (USD)',
    additionalFees: 'Additional Fees (USD)',
    
    // Buttons
    calculate: 'Calculate Costs',
    reset: 'Reset',
    uploadPO: 'Upload Purchase Order',
    export: 'Export Results',
    saveCalculation: 'Save Calculation',
    
    // Results
    results: 'Calculation Results',
    subtotal: 'Subtotal',
    tariffRate: 'Tariff Rate',
    tariffAmount: 'Tariff Amount',
    totalShipping: 'Total Shipping',
    totalInsurance: 'Total Insurance',
    additionalFeesTotal: 'Additional Fees',
    totalLandedCost: 'Total Landed Cost',
    perUnit: 'Per Unit',
    costBreakdown: 'Cost Breakdown',
    beforeTariffs: 'Before Tariffs',
    afterTariffs: 'After Tariffs',
    
    // Alerts and messages
    calculationComplete: 'Calculation complete',
    uploadInstructions: 'Drag and drop your purchase order file here, or click to select',
    uploadFormats: 'Supported formats: .xlsx, .csv, .pdf',
    noResults: 'Enter product details and calculate to see results',
    calculating: 'Calculating...',
    
    // Errors
    errorInvalidHts: 'Invalid HTS code format',
    errorCalculation: 'Error calculating costs. Please try again.',
    errorUpload: 'Error uploading file. Please try again.',
    
    // Other
    recentCalculations: 'Recent Calculations',
    viewAll: 'View All',
    noRecentCalculations: 'No recent calculations',
    tariffImpact: 'Tariff Impact',
    impactAnalysis: 'Impact Analysis',
    savingsOpportunities: 'Savings Opportunities',
    noSavingsFound: 'No savings opportunities identified',
  },
  es: {
    // Page title and description
    title: 'Calculadora de Costos de Emergencia',
    subtitle: 'Calcule costos de desembarque y aranceles para sus importaciones',
    description: 'Cargue órdenes de compra o ingrese detalles del producto para calcular instantáneamente aranceles, impuestos y costos totales de desembarque.',
    
    // Form labels
    productDetails: 'Detalles del Producto',
    productName: 'Nombre del Producto',
    productNamePlaceholder: 'Ingrese nombre del producto',
    htsCode: 'Código HTS',
    htsCodePlaceholder: 'ej., 8544.42',
    htsCodeHelp: 'Código del Sistema Armonizado de Aranceles para su producto',
    findHtsCode: 'Encontrar Código HTS',
    countryOfOrigin: 'País de Origen',
    selectCountry: 'Seleccionar país',
    pricing: 'Precios y Cantidad',
    unitPrice: 'Precio Unitario (USD)',
    quantity: 'Cantidad',
    additionalCosts: 'Costos Adicionales',
    shippingCost: 'Costo de Envío (USD)',
    insuranceCost: 'Costo de Seguro (USD)',
    additionalFees: 'Tarifas Adicionales (USD)',
    
    // Buttons
    calculate: 'Calcular Costos',
    reset: 'Reiniciar',
    uploadPO: 'Cargar Orden de Compra',
    export: 'Exportar Resultados',
    saveCalculation: 'Guardar Cálculo',
    
    // Results
    results: 'Resultados del Cálculo',
    subtotal: 'Subtotal',
    tariffRate: 'Tasa de Arancel',
    tariffAmount: 'Monto del Arancel',
    totalShipping: 'Envío Total',
    totalInsurance: 'Seguro Total',
    additionalFeesTotal: 'Tarifas Adicionales',
    totalLandedCost: 'Costo Total Desembarcado',
    perUnit: 'Por Unidad',
    costBreakdown: 'Desglose de Costos',
    beforeTariffs: 'Antes de Aranceles',
    afterTariffs: 'Después de Aranceles',
    
    // Alerts and messages
    calculationComplete: 'Cálculo completo',
    uploadInstructions: 'Arrastre y suelte su archivo de orden de compra aquí, o haga clic para seleccionar',
    uploadFormats: 'Formatos soportados: .xlsx, .csv, .pdf',
    noResults: 'Ingrese detalles del producto y calcule para ver resultados',
    calculating: 'Calculando...',
    
    // Errors
    errorInvalidHts: 'Formato de código HTS inválido',
    errorCalculation: 'Error al calcular costos. Por favor intente de nuevo.',
    errorUpload: 'Error al cargar archivo. Por favor intente de nuevo.',
    
    // Other
    recentCalculations: 'Cálculos Recientes',
    viewAll: 'Ver Todos',
    noRecentCalculations: 'No hay cálculos recientes',
    tariffImpact: 'Impacto de Aranceles',
    impactAnalysis: 'Análisis de Impacto',
    savingsOpportunities: 'Oportunidades de Ahorro',
    noSavingsFound: 'No se identificaron oportunidades de ahorro',
  },
};

// Sample countries for the dropdown
const countries = [
  { code: 'CN', name: { en: 'China', es: 'China' } },
  { code: 'MX', name: { en: 'Mexico', es: 'México' } },
  { code: 'VN', name: { en: 'Vietnam', es: 'Vietnam' } },
  { code: 'IN', name: { en: 'India', es: 'India' } },
  { code: 'TH', name: { en: 'Thailand', es: 'Tailandia' } },
  { code: 'MY', name: { en: 'Malaysia', es: 'Malasia' } },
  { code: 'ID', name: { en: 'Indonesia', es: 'Indonesia' } },
  { code: 'KR', name: { en: 'South Korea', es: 'Corea del Sur' } },
  { code: 'JP', name: { en: 'Japan', es: 'Japón' } },
  { code: 'DE', name: { en: 'Germany', es: 'Alemania' } },
  { code: 'IT', name: { en: 'Italy', es: 'Italia' } },
  { code: 'FR', name: { en: 'France', es: 'Francia' } },
  { code: 'GB', name: { en: 'United Kingdom', es: 'Reino Unido' } },
  { code: 'CA', name: { en: 'Canada', es: 'Canadá' } },
  { code: 'BR', name: { en: 'Brazil', es: 'Brasil' } },
];

// Sample tariff rates by country (in a real app, this would come from an API or database)
const sampleTariffRates: Record<string, number> = {
  'CN': 0.25, // 25% tariff for China
  'MX': 0.00, // 0% tariff for Mexico (USMCA)
  'VN': 0.10, // 10% tariff for Vietnam
  'IN': 0.15, // 15% tariff for India
  'TH': 0.12, // 12% tariff for Thailand
  'MY': 0.08, // 8% tariff for Malaysia
  'ID': 0.12, // 12% tariff for Indonesia
  'KR': 0.05, // 5% tariff for South Korea
  'JP': 0.03, // 3% tariff for Japan
  'DE': 0.03, // 3% tariff for Germany
  'IT': 0.03, // 3% tariff for Italy
  'FR': 0.03, // 3% tariff for France
  'GB': 0.05, // 5% tariff for United Kingdom
  'CA': 0.00, // 0% tariff for Canada (USMCA)
  'BR': 0.15, // 15% tariff for Brazil
};

// Sample recent calculations (in a real app, these would come from the database)
const sampleRecentCalculations = [
  {
    id: 1,
    productName: 'Electronic Components',
    htsCode: '8544.42',
    countryOfOrigin: 'CN',
    totalCost: 12580.75,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 2,
    productName: 'Plastic Housings',
    htsCode: '3926.90',
    countryOfOrigin: 'MX',
    totalCost: 5240.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
];

export default function CalculatorPage() {
  // Get locale from URL params
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  // Get translations for the current locale
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Initialize Supabase client
  const supabase = createClientComponentClient();
  
  // State for calculation results
  const [results, setResults] = useState<{
    subtotal: number;
    tariffRate: number;
    tariffAmount: number;
    totalShipping: number;
    totalInsurance: number;
    additionalFeesTotal: number;
    totalLandedCost: number;
    costPerUnit: number;
  } | null>(null);
  
  // State for loading
  const [isCalculating, setIsCalculating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      productName: '',
      htsCode: '',
      countryOfOrigin: '',
      unitPrice: 0,
      quantity: 1,
      shippingCost: 0,
      insuranceCost: 0,
      additionalFees: 0,
    },
  });
  
  // Watch form values for real-time updates
  const formValues = watch();
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // In a real app, we would parse the file and extract data
      // For this demo, we'll just simulate it with a timeout
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        // Simulate filling the form with data from the file
        setValue('productName', 'Imported Electronics');
        setValue('htsCode', '8544.42');
        setValue('countryOfOrigin', 'CN');
        setValue('unitPrice', 125.50);
        setValue('quantity', 100);
        setValue('shippingCost', 750);
        setValue('insuranceCost', 250);
        setValue('additionalFees', 180);
      }, 1500);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: CalculatorFormData) => {
    setIsCalculating(true);
    
    try {
      // In a real app, we would make an API call to get the actual tariff rate
      // For this demo, we'll use our sample data
      const tariffRate = sampleTariffRates[data.countryOfOrigin] || 0.10; // Default to 10% if not found
      
      // Calculate costs
      const subtotal = data.unitPrice * data.quantity;
      const tariffAmount = subtotal * tariffRate;
      const totalLandedCost = subtotal + tariffAmount + data.shippingCost + data.insuranceCost + data.additionalFees;
      const costPerUnit = totalLandedCost / data.quantity;
      
      // Set results
      setResults({
        subtotal,
        tariffRate,
        tariffAmount,
        totalShipping: data.shippingCost,
        totalInsurance: data.insuranceCost,
        additionalFeesTotal: data.additionalFees,
        totalLandedCost,
        costPerUnit,
      });
      
      // In a real app, we would save this calculation to the database
      // For this demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Calculation error:', error);
      // In a real app, we would show an error message
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    reset();
    setResults(null);
    setSelectedFile(null);
  };
  
  // Handle export
  const handleExport = () => {
    // In a real app, we would generate a PDF or Excel file
    // For this demo, we'll just log to console
    console.log('Exporting results:', results);
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate">{t.title}</h1>
        <p className="mt-1 text-slate/70">{t.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate mb-4">{t.uploadPO}</h2>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.csv,.pdf"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Uploading...</p>
                </div>
              ) : selectedFile ? (
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-success mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-slate/70 mt-1">Click to upload a different file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="text-slate mb-1">{t.uploadInstructions}</p>
                  <p className="text-sm text-slate/70">{t.uploadFormats}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Calculator Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
            {/* Product Details Section */}
            <h2 className="text-lg font-semibold text-slate mb-4">{t.productDetails}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="form-label">{t.productName}</label>
                <input
                  id="productName"
                  type="text"
                  className={`form-input ${errors.productName ? 'border-danger' : ''}`}
                  placeholder={t.productNamePlaceholder}
                  {...register('productName')}
                />
                {errors.productName && (
                  <p className="form-error">{errors.productName.message}</p>
                )}
              </div>
              
              {/* HTS Code */}
              <div>
                <div className="flex justify-between">
                  <label htmlFor="htsCode" className="form-label">{t.htsCode}</label>
                  <Link href="https://hts.usitc.gov/" target="_blank" className="text-xs text-primary">
                    {t.findHtsCode}
                  </Link>
                </div>
                <input
                  id="htsCode"
                  type="text"
                  className={`form-input ${errors.htsCode ? 'border-danger' : ''}`}
                  placeholder={t.htsCodePlaceholder}
                  {...register('htsCode')}
                />
                {errors.htsCode ? (
                  <p className="form-error">{errors.htsCode.message}</p>
                ) : (
                  <p className="text-xs text-slate/70 mt-1">{t.htsCodeHelp}</p>
                )}
              </div>
              
              {/* Country of Origin */}
              <div>
                <label htmlFor="countryOfOrigin" className="form-label">{t.countryOfOrigin}</label>
                <select
                  id="countryOfOrigin"
                  className={`form-input ${errors.countryOfOrigin ? 'border-danger' : ''}`}
                  {...register('countryOfOrigin')}
                >
                  <option value="">{t.selectCountry}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name[locale as keyof typeof country.name] || country.name.en}
                    </option>
                  ))}
                </select>
                {errors.countryOfOrigin && (
                  <p className="form-error">{errors.countryOfOrigin.message}</p>
                )}
              </div>
            </div>
            
            {/* Pricing & Quantity Section */}
            <h2 className="text-lg font-semibold text-slate mb-4">{t.pricing}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Unit Price */}
              <div>
                <label htmlFor="unitPrice" className="form-label">{t.unitPrice}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    className={`form-input pl-7 ${errors.unitPrice ? 'border-danger' : ''}`}
                    {...register('unitPrice', { valueAsNumber: true })}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="form-error">{errors.unitPrice.message}</p>
                )}
              </div>
              
              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="form-label">{t.quantity}</label>
                <input
                  id="quantity"
                  type="number"
                  className={`form-input ${errors.quantity ? 'border-danger' : ''}`}
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="form-error">{errors.quantity.message}</p>
                )}
              </div>
            </div>
            
            {/* Additional Costs Section */}
            <h2 className="text-lg font-semibold text-slate mb-4">{t.additionalCosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Shipping Cost */}
              <div>
                <label htmlFor="shippingCost" className="form-label">{t.shippingCost}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    className={`form-input pl-7 ${errors.shippingCost ? 'border-danger' : ''}`}
                    {...register('shippingCost', { valueAsNumber: true })}
                  />
                </div>
                {errors.shippingCost && (
                  <p className="form-error">{errors.shippingCost.message}</p>
                )}
              </div>
              
              {/* Insurance Cost */}
              <div>
                <label htmlFor="insuranceCost" className="form-label">{t.insuranceCost}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="insuranceCost"
                    type="number"
                    step="0.01"
                    className={`form-input pl-7 ${errors.insuranceCost ? 'border-danger' : ''}`}
                    {...register('insuranceCost', { valueAsNumber: true })}
                  />
                </div>
                {errors.insuranceCost && (
                  <p className="form-error">{errors.insuranceCost.message}</p>
                )}
              </div>
              
              {/* Additional Fees */}
              <div>
                <label htmlFor="additionalFees" className="form-label">{t.additionalFees}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="additionalFees"
                    type="number"
                    step="0.01"
                    className={`form-input pl-7 ${errors.additionalFees ? 'border-danger' : ''}`}
                    {...register('additionalFees', { valueAsNumber: true })}
                  />
                </div>
                {errors.additionalFees && (
                  <p className="form-error">{errors.additionalFees.message}</p>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
                disabled={isCalculating}
              >
                {t.reset}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.calculating}
                  </div>
                ) : (
                  t.calculate
                )}
              </button>
            </div>
          </form>
          
          {/* Results Section */}
          {results && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate">{t.results}</h2>
                <button
                  type="button"
                  className="btn-secondary text-sm flex items-center"
                  onClick={handleExport}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {t.export}
                </button>
              </div>
              
              {/* Cost Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 text-slate/70">{t.subtotal}</td>
                      <td className="py-3 text-right font-medium">${results.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.tariffRate}</td>
                      <td className="py-3 text-right font-medium">{(results.tariffRate * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.tariffAmount}</td>
                      <td className="py-3 text-right font-medium">${results.tariffAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.totalShipping}</td>
                      <td className="py-3 text-right font-medium">${results.totalShipping.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.totalInsurance}</td>
                      <td className="py-3 text-right font-medium">${results.totalInsurance.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.additionalFeesTotal}</td>
                      <td className="py-3 text-right font-medium">${results.additionalFeesTotal.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-secondary">
                      <td className="py-3 font-semibold">{t.totalLandedCost}</td>
                      <td className="py-3 text-right font-bold text-primary">${results.totalLandedCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate/70">{t.perUnit}</td>
                      <td className="py-3 text-right font-medium">${results.costPerUnit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Visual Breakdown */}
              <div className="mt-8">
                <h3 className="text-md font-semibold text-slate mb-4">{t.costBreakdown}</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate/70">{t.beforeTariffs}</span>
                    <span className="text-sm font-medium">
                      ${(results.subtotal + results.totalShipping + results.totalInsurance + results.additionalFeesTotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-success h-2.5 rounded-full" 
                      style={{ width: `${(100 * (results.subtotal + results.totalShipping + results.totalInsurance + results.additionalFeesTotal) / results.totalLandedCost)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate/70">{t.afterTariffs}</span>
                    <span className="text-sm font-medium">${results.totalLandedCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-danger h-2.5 rounded-full" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-slate">
                          {t.tariffImpact}: +${results.tariffAmount.toFixed(2)} ({(results.tariffRate * 100).toFixed(1)}%)
                        </p>
                        <p className="text-xs text-slate/70 mt-1">
                          {formValues.countryOfOrigin === 'CN' ? 
                            'Consider alternative suppliers from Mexico or Canada (0% tariff under USMCA)' : 
                            'Explore options to reduce tariff impact through trade agreements or duty drawback programs'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Calculation Button */}
              <div className="mt-6 text-center">
                <button type="button" className="btn-primary">
                  {t.saveCalculation}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Calculations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate">{t.recentCalculations}</h2>
              <Link href={`/dashboard/${locale}/calculator/history`} className="text-sm text-primary hover:underline">
                {t.viewAll}
              </Link>
            </div>
            
            {sampleRecentCalculations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sampleRecentCalculations.map((calc) => (
                  <li key={calc.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate">{calc.productName}</p>
                        <p className="text-xs text-slate/70">
                          {calc.htsCode} • {countries.find(c => c.code === calc.countryOfOrigin)?.name[locale as keyof typeof countries[0].name] || calc.countryOfOrigin}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${calc.totalCost.toFixed(2)}</p>
                        <p className="text-xs text-slate/70">
                          {calc.date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate/70 py-4">{t.noRecentCalculations}</p>
            )}
          </div>
          
          {/* Impact Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate mb-4">{t.impactAnalysis}</h2>
            
            {results ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate/70">{t.tariffImpact}</span>
                  <span className="text-sm font-medium text-danger">
                    +{((results.tariffAmount / (results.subtotal + results.totalShipping + results.totalInsurance + results.additionalFeesTotal)) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate mb-2">{t.savingsOpportunities}</h3>
                  <ul className="space-y-2 text-sm">
                    {formValues.countryOfOrigin === 'CN' && (
                      <>
                        <li className="flex items-start">
                          <svg className="w-4 h-4 text-success mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Switch to Mexico supplier: Save ${(results.tariffAmount).toFixed(2)} (25% tariff → 0%)</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-4 h-4 text-success mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Switch to Vietnam supplier: Save ${(results.tariffAmount * 0.6).toFixed(2)} (25% tariff → 10%)</span>
                        </li>
                      </>
                    )}
                    {formValues.countryOfOrigin !== 'CN' && (
                      <li className="text-slate/70">{t.noSavingsFound}</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-slate/70">{t.noResults}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
