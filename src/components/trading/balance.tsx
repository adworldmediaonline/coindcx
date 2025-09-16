'use client'

import { AccountBalance as AccountBalanceType, Balance } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign,
  PieChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceProps {
  accountBalance: AccountBalanceType
  className?: string
}

export const AccountBalance = ({ accountBalance, className }: BalanceProps) => {
  const { balances, totalValue, lastUpdate } = accountBalance

  const formatCurrency = (amount: number, currency = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }
    return `${amount.toFixed(6)} ${currency}`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBalanceStatus = (balance: Balance) => {
    if (balance.free > 0 && balance.used === 0) {
      return { status: 'available', color: 'text-green-600', icon: CheckCircle }
    }
    if (balance.used > 0) {
      return { status: 'in-use', color: 'text-yellow-600', icon: AlertCircle }
    }
    return { status: 'empty', color: 'text-muted-foreground', icon: AlertCircle }
  }

  const nonZeroBalances = balances.filter(b => b.total > 0)
  const usdBalance = balances.find(b => b.currency === 'USD' || b.currency === 'USDT')

  // Calculate allocation percentages
  const allocations = nonZeroBalances.map(balance => ({
    ...balance,
    percentage: (balance.total * (balance.currency === 'USD' ? 1 : 1)) / totalValue * 100 // Simplified conversion
  }))

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Account Balance
          </CardTitle>

          <div className="text-right">
            <div className="text-lg font-bold font-mono">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {formatTime(lastUpdate)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* USD Balance Highlight */}
        {usdBalance && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium">{usdBalance.currency}</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold">
                  {formatCurrency(usdBalance.total, usdBalance.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Free: {formatCurrency(usdBalance.free, usdBalance.currency)} | Used: {formatCurrency(usdBalance.used, usdBalance.currency)}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Asset Allocation */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Asset Allocation
          </h4>

          <div className="space-y-3">
            {allocations.slice(0, 5).map((balance) => {
              const { color, icon: StatusIcon } = getBalanceStatus(balance)

              return (
                <div key={balance.currency} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn('w-4 h-4', color)} />
                      <span className="font-medium">{balance.currency}</span>
                      <Badge variant="outline" className="text-xs">
                        {balance.percentage.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="text-right">
                      <div className="font-mono">
                        {formatCurrency(balance.total, balance.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Free: {balance.free.toFixed(6)} | Used: {balance.used.toFixed(6)}
                      </div>
                    </div>
                  </div>

                  <Progress value={balance.percentage} className="h-2" />
                </div>
              )
            })}
          </div>

          {allocations.length > 5 && (
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                +{allocations.length - 5} more assets
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {nonZeroBalances.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Assets
            </div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {balances.filter(b => b.used > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">
              In Use
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {usdBalance && usdBalance.free < 100 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Low Balance Warning
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Your available {usdBalance.currency} balance is low. Consider adding funds for optimal trading.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
