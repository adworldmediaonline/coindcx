import { NextRequest, NextResponse } from 'next/server'
import { createCoinDCXAPI, createMockCoinDCXAPI } from '@/lib/coindcx-api'
import { APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const timeframe = searchParams.get('timeframe') || '1h'
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    // Check if we should use mock data (for development)
    const useMock = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true'

    const apiKey = process.env.COINDCX_API_KEY
    const secret = process.env.COINDCX_SECRET

    if (!useMock && (!apiKey || !secret)) {
      return NextResponse.json(
        { success: false, error: 'CoinDCX credentials not configured' },
        { status: 500 }
      )
    }

    const coindcxAPI = useMock
      ? createMockCoinDCXAPI()
      : createCoinDCXAPI({ apiKey: apiKey!, secret: secret! })

    // Get market data
    const marketData = await coindcxAPI.getMarketData(symbol)
    const ohlcvData = await coindcxAPI.getOHLCVData(symbol, timeframe, limit)

    const response: APIResponse = {
      success: true,
      data: {
        ...marketData,
        ohlcv: ohlcvData
      },
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching market data:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
