'use client'

import { useState } from 'react'
import { AIStrategy, RiskSettings } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StrategyManagerProps {
  strategies: AIStrategy[]
  onStrategyUpdate: (strategy: AIStrategy) => void
  onStrategyCreate: (strategy: AIStrategy) => void
  riskSettings: RiskSettings
  onRiskSettingsUpdate: (settings: RiskSettings) => void
  className?: string
}

export const StrategyManager = ({
  strategies,
  onStrategyUpdate,
  onStrategyCreate,
  riskSettings,
  onRiskSettingsUpdate,
  className
}: StrategyManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<AIStrategy | null>(null)

  const getStrategyStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-muted-foreground'
  }

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleStrategyToggle = (strategy: AIStrategy) => {
    const updatedStrategy = { ...strategy, enabled: !strategy.enabled }
    onStrategyUpdate(updatedStrategy)
  }

  const handleCreateStrategy = () => {
    const newStrategy: AIStrategy = {
      id: Date.now().toString(),
      name: 'New Strategy',
      description: 'Custom trading strategy',
      enabled: false,
      parameters: {
        rsiPeriod: 14,
        smaShort: 20,
        smaLong: 50,
        stopLoss: 0.02,
        takeProfit: 0.05
      },
      performance: {
        totalTrades: 0,
        winRate: 0,
        profitLoss: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      }
    }

    onStrategyCreate(newStrategy)
    setEditingStrategy(newStrategy)
    setIsCreateDialogOpen(true)
  }

  const StrategyCard = ({ strategy }: { strategy: AIStrategy }) => (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      strategy.enabled && 'ring-2 ring-primary/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className={cn('w-5 h-5', getStrategyStatusColor(strategy.enabled))} />
            {strategy.name}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant={strategy.enabled ? 'default' : 'secondary'}>
              {strategy.enabled ? 'Active' : 'Inactive'}
            </Badge>

            <Switch
              checked={strategy.enabled}
              onCheckedChange={() => handleStrategyToggle(strategy)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{strategy.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total Trades</div>
            <div className="font-semibold">{strategy.performance.totalTrades}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className={cn('font-semibold', getPerformanceColor(strategy.performance.winRate))}>
              {strategy.performance.winRate.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">P&L</div>
            <div className={cn('font-semibold', getPerformanceColor(strategy.performance.profitLoss))}>
              {formatCurrency(strategy.performance.profitLoss)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Max Drawdown</div>
            <div className="font-semibold text-red-600">
              -{strategy.performance.maxDrawdown.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
          <span className={cn(
            'font-semibold',
            strategy.performance.sharpeRatio > 1 ? 'text-green-600' :
            strategy.performance.sharpeRatio < 0 ? 'text-red-600' : 'text-muted-foreground'
          )}>
            {strategy.performance.sharpeRatio.toFixed(2)}
          </span>
        </div>

        {/* Win Rate Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Win Rate</span>
            <span>{strategy.performance.winRate.toFixed(1)}%</span>
          </div>
          <Progress value={strategy.performance.winRate} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingStrategy(strategy)
              setIsCreateDialogOpen(true)
            }}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>

          <Button
            variant={strategy.enabled ? 'destructive' : 'default'}
            size="sm"
            onClick={() => handleStrategyToggle(strategy)}
            className="flex-1"
          >
            {strategy.enabled ? <XCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
            {strategy.enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const StrategyEditor = ({ strategy }: { strategy: AIStrategy }) => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="strategy-name">Strategy Name</Label>
        <Input
          id="strategy-name"
          value={strategy.name}
          onChange={(e) => setEditingStrategy({ ...strategy, name: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="strategy-description">Description</Label>
        <Input
          id="strategy-description"
          value={strategy.description}
          onChange={(e) => setEditingStrategy({ ...strategy, description: e.target.value })}
        />
      </div>

      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rsi-period">RSI Period</Label>
              <Input
                id="rsi-period"
                type="number"
                value={strategy.parameters.rsiPeriod?.toString() || '14'}
                onChange={(e) => setEditingStrategy({
                  ...strategy,
                  parameters: { ...strategy.parameters, rsiPeriod: parseInt(e.target.value) }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sma-short">SMA Short Period</Label>
              <Input
                id="sma-short"
                type="number"
                value={strategy.parameters.smaShort?.toString() || '20'}
                onChange={(e) => setEditingStrategy({
                  ...strategy,
                  parameters: { ...strategy.parameters, smaShort: parseInt(e.target.value) }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sma-long">SMA Long Period</Label>
              <Input
                id="sma-long"
                type="number"
                value={strategy.parameters.smaLong?.toString() || '50'}
                onChange={(e) => setEditingStrategy({
                  ...strategy,
                  parameters: { ...strategy.parameters, smaLong: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss (%)</Label>
              <Input
                id="stop-loss"
                type="number"
                step="0.01"
                value={strategy.parameters.stopLoss?.toString() || '0.02'}
                onChange={(e) => setEditingStrategy({
                  ...strategy,
                  parameters: { ...strategy.parameters, stopLoss: parseFloat(e.target.value) }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="take-profit">Take Profit (%)</Label>
              <Input
                id="take-profit"
                type="number"
                step="0.01"
                value={strategy.parameters.takeProfit?.toString() || '0.05'}
                onChange={(e) => setEditingStrategy({
                  ...strategy,
                  parameters: { ...strategy.parameters, takeProfit: parseFloat(e.target.value) }
                })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => {
            if (editingStrategy) {
              onStrategyUpdate(editingStrategy)
            }
            setIsCreateDialogOpen(false)
            setEditingStrategy(null)
          }}
          className="flex-1"
        >
          Save Strategy
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false)
            setEditingStrategy(null)
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI Strategy Manager
          </h2>
          <p className="text-muted-foreground">
            Manage and configure your automated trading strategies
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateStrategy}>
              <Plus className="w-4 h-4 mr-2" />
              New Strategy
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStrategy?.id ? 'Edit Strategy' : 'Create New Strategy'}
              </DialogTitle>
            </DialogHeader>

            {editingStrategy && <StrategyEditor strategy={editingStrategy} />}
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Global Risk Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-position">Max Position Size (%)</Label>
              <Input
                id="max-position"
                type="number"
                step="0.01"
                value={riskSettings.maxPositionSize}
                onChange={(e) => onRiskSettingsUpdate({
                  ...riskSettings,
                  maxPositionSize: parseFloat(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-risk-trade">Max Risk per Trade (%)</Label>
              <Input
                id="max-risk-trade"
                type="number"
                step="0.01"
                value={riskSettings.maxRiskPerTrade}
                onChange={(e) => onRiskSettingsUpdate({
                  ...riskSettings,
                  maxRiskPerTrade: parseFloat(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-drawdown">Max Drawdown (%)</Label>
              <Input
                id="max-drawdown"
                type="number"
                step="0.01"
                value={riskSettings.maxDrawdown}
                onChange={(e) => onRiskSettingsUpdate({
                  ...riskSettings,
                  maxDrawdown: parseFloat(e.target.value)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage</Label>
              <Input
                id="leverage"
                type="number"
                step="0.1"
                value={riskSettings.leverage}
                onChange={(e) => onRiskSettingsUpdate({
                  ...riskSettings,
                  leverage: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
