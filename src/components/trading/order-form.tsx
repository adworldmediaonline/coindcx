'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  Calculator,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  onSubmitOrder: (order: OrderData) => void;
  className?: string;
}

interface OrderData {
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  amount: number;
  price?: number;
  stopPrice?: number;
  total?: number;
}

type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

export const OrderForm = ({
  symbol,
  currentPrice,
  balance,
  onSubmitOrder,
  className,
}: OrderFormProps) => {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [usePercentage, setUsePercentage] = useState(false);
  const [percentage, setPercentage] = useState('');
  console.log(percentage);
  const orderTypes = [
    {
      value: 'market',
      label: 'Market',
      description: 'Execute at current market price',
    },
    {
      value: 'limit',
      label: 'Limit',
      description: 'Execute at specified price or better',
    },
    {
      value: 'stop',
      label: 'Stop',
      description: 'Execute when price reaches stop level',
    },
    {
      value: 'stop_limit',
      label: 'Stop Limit',
      description: 'Stop order with limit price',
    },
  ];

  const quickAmounts = [25, 50, 75, 100];

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0;
    const prc = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    return amt * prc;
  };

  const calculateAmountFromPercentage = (percent: number) => {
    const maxAmount = balance / currentPrice;
    return (maxAmount * percent) / 100;
  };

  const handlePercentageChange = (percent: string) => {
    setPercentage(percent);
    if (percent) {
      const calculatedAmount = calculateAmountFromPercentage(
        parseFloat(percent)
      );
      setAmount(calculatedAmount.toFixed(6));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (usePercentage) {
      const total = (parseFloat(value) || 0) * currentPrice;
      const percent = (total / balance) * 100;
      setPercentage(percent.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderData: OrderData = {
      side,
      type: orderType,
      amount: parseFloat(amount),
    };

    if (orderType === 'limit' || orderType === 'stop_limit') {
      orderData.price = parseFloat(price);
    }

    if (orderType === 'stop' || orderType === 'stop_limit') {
      orderData.stopPrice = parseFloat(stopPrice);
    }

    orderData.total = calculateTotal();

    onSubmitOrder(orderData);
  };

  const total = calculateTotal();
  const insufficientFunds = total > balance;
  const isValid = amount && !insufficientFunds;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Place Order
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Side */}
        <div className="flex gap-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            onClick={() => setSide('buy')}
            className={cn(
              'flex-1',
              side === 'buy' && 'bg-green-600 hover:bg-green-700'
            )}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'destructive' : 'outline'}
            onClick={() => setSide('sell')}
            className="flex-1"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Sell
          </Button>
        </div>

        {/* Order Type */}
        <div className="space-y-3">
          <Label>Order Type</Label>
          <Select
            value={orderType}
            onValueChange={value => setOrderType(value as OrderType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">Amount ({symbol.split('/')[0]})</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUsePercentage(!usePercentage)}
              className="text-xs"
            >
              {usePercentage ? (
                <DollarSign className="w-3 h-3" />
              ) : (
                <Percent className="w-3 h-3" />
              )}
              {usePercentage ? 'USD' : '%'}
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.000000"
              value={amount}
              onChange={e => handleAmountChange(e.target.value)}
              step="0.000001"
              min="0"
            />

            {usePercentage && (
              <div className="flex gap-2">
                {quickAmounts.map(percent => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentageChange(percent.toString())}
                    className="flex-1 text-xs"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price Inputs */}
        {(orderType === 'limit' || orderType === 'stop_limit') && (
          <div className="space-y-3">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              placeholder={currentPrice.toString()}
              value={price}
              onChange={e => setPrice(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
        )}

        {(orderType === 'stop' || orderType === 'stop_limit') && (
          <div className="space-y-3">
            <Label htmlFor="stopPrice">Stop Price (USD)</Label>
            <Input
              id="stopPrice"
              type="number"
              placeholder="0.00"
              value={stopPrice}
              onChange={e => setStopPrice(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
        )}

        <Separator />

        {/* Order Summary */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-mono">${currentPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Value</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-mono">${balance.toFixed(2)}</span>
          </div>

          {insufficientFunds && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Insufficient funds for this order
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            'w-full',
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          )}
          size="lg"
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol.split('/')[0]}
          {amount && (
            <Badge variant="secondary" className="ml-2">
              {parseFloat(amount).toFixed(6)}
            </Badge>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
