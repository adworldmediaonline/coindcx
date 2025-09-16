import { NextResponse } from 'next/server'
import { createCoinDCXAPI, createMockCoinDCXAPI } from '@/lib/coindcx-api'
import { APIResponse } from '@/lib/types'

export async function GET() {
  try {
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

    const balance = await coindcxAPI.getBalance()

    const response: APIResponse = {
      success: true,
      data: balance,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching balance:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
