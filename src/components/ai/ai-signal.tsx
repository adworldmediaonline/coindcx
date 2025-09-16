'use client'

import { TradingSignal } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AISignalProps {
  signal: TradingSignal
  isActive?: boolean
  onExecute?: () => void
  onDismiss?: () => void
  className?: string
}

export const AISignal = ({
  signal,
  isActive = false,
  onExecute,
  onDismiss,
  className
}: AISignalProps) => {
  const getSignalIcon = () => {
    switch (signal.direction) {
      case 'buy':
        return <TrendingUp className="w-5 h-5" />
      case 'sell':
        return <TrendingDown className="w-5 h-5" />
      default:
        return <Minus className="w-5 h-5" />
    }
  }

  const getSignalColor = () => {
    switch (signal.direction) {
      case 'buy':
        return 'text-green-600 dark:text-green-400'
      case 'sell':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }


  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const renderIndicator = (label: string, value: number, unit = '', color = 'text-foreground') => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', color)}>
        {typeof value === 'number' ? value.toFixed(2) : value}{unit}
      </span>
    </div>
  )

  const getIndicatorColor = (value: number, thresholds: { good: number; bad: number }) => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value <= thresholds.bad) return 'text-red-600'
    return 'text-yellow-600'
  }

  return (
    <Card className={cn(
      'w-full transition-all duration-200',
      isActive && 'ring-2 ring-primary/50 shadow-lg',
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Signal
            {isActive && (
              <Badge variant="default" className="ml-2">
                <Zap className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-1', getSignalColor())}>
              {getSignalIcon()}
              <span className="font-semibold uppercase text-sm">
                {signal.direction}
              </span>
            </div>

            <Badge variant="outline" className="font-mono">
              {signal.symbol}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(signal.timestamp)}
          </span>
          <span>Strength: {signal.strength}/100</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">AI Confidence</span>
            <span className="font-medium">{signal.confidence}%</span>
          </div>
          <Progress
            value={signal.confidence}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Technical Indicators
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {renderIndicator(
              'RSI',
              signal.indicators.rsi,
              '',
              getIndicatorColor(signal.indicators.rsi, { good: 70, bad: 30 })
            )}

            {renderIndicator(
              'MACD',
              signal.indicators.macd.value,
              '',
              signal.indicators.macd.value > 0 ? 'text-green-600' : 'text-red-600'
            )}

            {renderIndicator(
              'SMA 20',
              signal.indicators.movingAverages.sma20,
              '$'
            )}

            {renderIndicator(
              'SMA 50',
              signal.indicators.movingAverages.sma50,
              '$'
            )}

            {renderIndicator(
              'BB Upper',
              signal.indicators.bollingerBands.upper,
              '$'
            )}

            {renderIndicator(
              'ATR',
              signal.indicators.atr,
              '%'
            )}
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">AI Reasoning</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {signal.reasoning.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        {isActive && (
          <div className="flex gap-2 pt-4 border-t">
            {onExecute && (
              <Button
                onClick={onExecute}
                className={cn(
                  'flex-1',
                  signal.direction === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {signal.direction === 'buy' ? 'Execute Buy' : 'Execute Sell'}
              </Button>
            )}

            {onDismiss && (
              <Button
                variant="outline"
                onClick={onDismiss}
                className="flex-1"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}

        {/* Signal Status */}
        {!isActive && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              Signal requires manual review before execution
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
