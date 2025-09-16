import { NextRequest, NextResponse } from 'next/server';
import { createCoinDCXAPI } from '@/lib/coindcx-api';
import { APIResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const timeframe = searchParams.get('timeframe') || '1h';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Always use real CoinDCX API data (not mock)
    const apiKey = process.env.COINDCX_API_KEY;
    const secret = process.env.COINDCX_SECRET;

    if (!apiKey || !secret) {
      return NextResponse.json(
        {
          success: false,
          error:
            'CoinDCX API credentials not configured. Please set COINDCX_API_KEY and COINDCX_SECRET in .env file',
        },
        { status: 500 }
      );
    }

    const coindcxAPI = createCoinDCXAPI({ apiKey, secret });

    // Get OHLCV data only
    const ohlcvData = await coindcxAPI.getOHLCVData(symbol, timeframe, limit);

    const response: APIResponse = {
      success: true,
      data: ohlcvData,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching OHLCV data:', error);

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
