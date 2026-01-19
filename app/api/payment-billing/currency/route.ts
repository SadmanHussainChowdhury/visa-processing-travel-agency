import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';

// Mock exchange rates data
const exchangeRates: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.92,
  'GBP': 0.79,
  'CAD': 1.36,
  'AUD': 1.52,
  'JPY': 149.5,
  'CHF': 0.88,
  'CNY': 7.24,
  'INR': 83.1,
  'BRL': 4.95
};

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would connect to a database to store currency settings
    // For now, we're using mock data
    
    const currencies = Object.keys(exchangeRates).map(currency => ({
      code: currency,
      name: getCurrencyName(currency),
      isActive: true,
      exchangeRate: exchangeRates[currency],
      lastUpdated: new Date().toISOString()
    }));

    const currencyData = {
      currencies,
      baseCurrency: 'USD',
      exchangeRates,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(currencyData);
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real application, this would connect to a database to store currency settings
    // For now, we're simulating the functionality
    
    const body = await request.json();
    const { action } = body;

    switch(action) {
      case 'convert-currency':
        if (!body.fromCurrency || !body.toCurrency || typeof body.amount === 'undefined') {
          return NextResponse.json(
            { error: 'Missing required fields for currency conversion' }, 
            { status: 400 }
          );
        }

        const fromRate = exchangeRates[body.fromCurrency];
        const toRate = exchangeRates[body.toCurrency];

        if (!fromRate || !toRate) {
          return NextResponse.json(
            { error: 'Unsupported currency' }, 
            { status: 400 }
          );
        }

        // Convert via USD as base
        const usdAmount = body.amount / fromRate;
        const convertedAmount = usdAmount * toRate;

        return NextResponse.json({ 
          success: true,
          convertedAmount: parseFloat(convertedAmount.toFixed(2)),
          fromCurrency: body.fromCurrency,
          toCurrency: body.toCurrency,
          originalAmount: body.amount
        });

      case 'update-exchange-rate':
        if (!body.currency || typeof body.rate === 'undefined') {
          return NextResponse.json(
            { error: 'Missing required fields for exchange rate update' }, 
            { status: 400 }
          );
        }

        // In a real app, this would update the database
        // For now, we'll just return success
        return NextResponse.json({ 
          success: true,
          message: `Exchange rate for ${body.currency} updated to ${body.rate}`
        });

      case 'enable-currency':
        if (!body.currency) {
          return NextResponse.json(
            { error: 'Currency code is required to enable' }, 
            { status: 400 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: `${body.currency} currency enabled`
        });

      case 'disable-currency':
        if (!body.currency) {
          return NextResponse.json(
            { error: 'Currency code is required to disable' }, 
            { status: 400 }
          );
        }

        return NextResponse.json({ 
          success: true,
          message: `${body.currency} currency disabled`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling currency action:', error);
    return NextResponse.json(
      { error: 'Failed to handle currency action' }, 
      { status: 500 }
    );
  }
}

// Helper function to get currency names
function getCurrencyName(code: string): string {
  const currencyNames: Record<string, string> = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'JPY': 'Japanese Yen',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'INR': 'Indian Rupee',
    'BRL': 'Brazilian Real'
  };
  
  return currencyNames[code] || code;
}