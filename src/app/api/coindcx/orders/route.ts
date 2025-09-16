import { NextRequest, NextResponse } from 'next/server'
import { createCoinDCXAPI, createMockCoinDCXAPI } from '@/lib/coindcx-api'
import { APIResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

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

    const orders = await coindcxAPI.getOrders(symbol || undefined)

    const response: APIResponse = {
      success: true,
      data: orders,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching orders:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { side, symbol, amount, price, type } = body

    // Validate required fields
    if (!side || !symbol || !amount || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: side, symbol, amount, type' },
        { status: 400 }
      )
    }

    // Validate order type
    if (!['market', 'limit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order type. Must be market or limit' },
        { status: 400 }
      )
    }

    // Validate side
    if (!['buy', 'sell'].includes(side)) {
      return NextResponse.json(
        { success: false, error: 'Invalid side. Must be buy or sell' },
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

    const order = await coindcxAPI.placeOrder({
      side,
      symbol,
      amount: parseFloat(amount),
      price: price ? parseFloat(price) : undefined,
      type
    })

    const response: APIResponse = {
      success: true,
      data: order,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error placing order:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
