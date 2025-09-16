import { NextRequest, NextResponse } from 'next/server'
import { BotState, APIResponse } from '@/lib/types'

// Mock bot state - in production, this would be stored in a database
let botState: BotState = {
  status: 'idle',
  isConnected: false,
  lastUpdate: Date.now(),
  uptime: 0,
  activeTrades: 0,
  totalTrades: 0,
  currentSignal: undefined,
  lastError: undefined
}

// Simple bot state management
class BotManager {
  private startTime: number | null = null

  start() {
    botState.status = 'running'
    botState.isConnected = true
    botState.lastUpdate = Date.now()
    botState.lastError = undefined
    this.startTime = Date.now()
  }

  pause() {
    botState.status = 'paused'
    botState.lastUpdate = Date.now()
  }

  stop() {
    botState.status = 'stopped'
    botState.isConnected = false
    botState.lastUpdate = Date.now()
    botState.uptime = this.startTime ? Date.now() - this.startTime : 0
  }

  getStatus(): BotState {
    // Update uptime if running
    if (botState.status === 'running' && this.startTime) {
      botState.uptime = Date.now() - this.startTime
    }

    return { ...botState }
  }

  updateStatus(updates: Partial<BotState>) {
    botState = { ...botState, ...updates, lastUpdate: Date.now() }
  }

  simulateTrading() {
    if (botState.status === 'running') {
      // Simulate some trading activity
      botState.activeTrades = Math.floor(Math.random() * 3)
      botState.totalTrades += Math.floor(Math.random() * 2)

      // Simulate occasional errors
      if (Math.random() < 0.05) {
        botState.lastError = 'Network connectivity issue'
        botState.status = 'error'
      }
    }
  }
}

const botManager = new BotManager()

// Simulate bot activity every 30 seconds
setInterval(() => {
  botManager.simulateTrading()
}, 30000)

export async function GET() {
  try {
    const status = botManager.getStatus()

    const response: APIResponse = {
      success: true,
      data: status,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching bot status:', error)

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
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action parameter is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start':
        botManager.start()
        break
      case 'pause':
        botManager.pause()
        break
      case 'stop':
        botManager.stop()
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Must be start, pause, or stop' },
          { status: 400 }
        )
    }

    const status = botManager.getStatus()

    const response: APIResponse = {
      success: true,
      data: status,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating bot status:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
