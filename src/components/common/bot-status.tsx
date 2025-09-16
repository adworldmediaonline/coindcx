'use client'

import { BotState } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BotStatusProps {
  botState: BotState
  onStart?: () => void
  onPause?: () => void
  onStop?: () => void
  className?: string
}

const statusConfig = {
  idle: {
    icon: Clock,
    label: 'Idle',
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  },
  running: {
    icon: Activity,
    label: 'Running',
    variant: 'default' as const,
    color: 'text-green-600'
  },
  paused: {
    icon: Pause,
    label: 'Paused',
    variant: 'outline' as const,
    color: 'text-yellow-600'
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    variant: 'destructive' as const,
    color: 'text-red-600'
  },
  stopped: {
    icon: Square,
    label: 'Stopped',
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  }
}

export const BotStatus = ({
  botState,
  onStart,
  onPause,
  onStop,
  className
}: BotStatusProps) => {
  const config = statusConfig[botState.status]
  const StatusIcon = config.icon

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionStatus = () => {
    return botState.isConnected ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Bot Status
          </CardTitle>
          <div className="flex items-center gap-2">
            {getConnectionStatus()}
            <Badge variant={config.variant} className={config.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          {onStart && botState.status === 'idle' && (
            <Button onClick={onStart} size="sm" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Bot
            </Button>
          )}

          {onPause && botState.status === 'running' && (
            <Button onClick={onPause} variant="outline" size="sm" className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}

          {onStop && (botState.status === 'running' || botState.status === 'paused') && (
            <Button onClick={onStop} variant="destructive" size="sm" className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-mono">{formatUptime(botState.uptime)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Trades</span>
              <span className="font-semibold">{botState.activeTrades}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Trades</span>
              <span>{botState.totalTrades}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Update</span>
              <span className="font-mono text-xs">
                {new Date(botState.lastUpdate).toLocaleTimeString()}
              </span>
            </div>

            {botState.currentSignal && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Signal</span>
                <Badge
                  variant={botState.currentSignal.direction === 'buy' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {botState.currentSignal.direction.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {botState.lastError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  {botState.lastError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {botState.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bot Activity</span>
              <span className="font-medium">Active</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
