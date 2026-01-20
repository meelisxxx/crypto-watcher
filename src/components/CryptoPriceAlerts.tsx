import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, AlertCircle, Trash2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Alert {
  id: number;
  crypto: string;
  condition: 'above' | 'below';
  price: number;
  triggered: boolean;
  createdAt: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
}

const cryptoOptions: CryptoOption[] = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTCUSDT' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETHUSDT' },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNBUSDT' },
  { id: 'SOL', name: 'Solana', symbol: 'SOLUSDT' },
  { id: 'XRP', name: 'Ripple', symbol: 'XRPUSDT' },
  { id: 'ADA', name: 'Cardano', symbol: 'ADAUSDT' },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGEUSDT' },
  { id: 'AVAX', name: 'Avalanche', symbol: 'AVAXUSDT' }
];

export default function CryptoPriceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [newAlert, setNewAlert] = useState({
    crypto: 'BTC',
    condition: 'above' as 'above' | 'below',
    price: ''
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch prices from Binance API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = cryptoOptions.map(c => c.symbol);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=["${symbols.join('","')}"]`);
        const data = await response.json();
        
        const priceMap: Record<string, number> = {};
        data.forEach((item: { symbol: string; price: string }) => {
          const crypto = cryptoOptions.find(c => c.symbol === item.symbol);
          if (crypto) {
            priceMap[crypto.id] = parseFloat(item.price);
          }
        });
        setPrices(priceMap);
      } catch (error) {
        console.error('Viga hindade laadimisel:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);

    return () => clearInterval(interval);
  }, []);

  // Check alerts
  useEffect(() => {
    alerts.forEach(alert => {
      const currentPrice = prices[alert.crypto];
      if (!currentPrice) return;

      const triggered = 
        (alert.condition === 'above' && currentPrice >= alert.price) ||
        (alert.condition === 'below' && currentPrice <= alert.price);

      if (triggered && !alert.triggered) {
        const cryptoName = cryptoOptions.find(c => c.id === alert.crypto)?.name;
        const notification: Notification = {
          id: Date.now(),
          message: `🔔 ${cryptoName} on ${alert.condition === 'above' ? 'ületanud' : 'langenud alla'} $${alert.price.toLocaleString()}! Praegune hind: $${currentPrice.toLocaleString()}`,
          time: new Date().toLocaleTimeString()
        };
        
        setNotifications(prev => [notification, ...prev].slice(0, 5));
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, triggered: true } : a
        ));
      }
    });
  }, [prices, alerts]);

  const addAlert = () => {
    if (!newAlert.price || parseFloat(newAlert.price) <= 0) return;

    const alert: Alert = {
      id: Date.now(),
      crypto: newAlert.crypto,
      condition: newAlert.condition,
      price: parseFloat(newAlert.price),
      triggered: false,
      createdAt: new Date().toLocaleTimeString()
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ crypto: 'BTC', condition: 'above', price: '' });
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getCryptoInfo = (id: string) => cryptoOptions.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-hero-gradient p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Reaalajas hinnad</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Krüptohinna hoiatused
          </h1>
          <p className="text-muted-foreground text-lg">
            Jälgi oma lemmik krüptovaluutade hindu reaalajas
          </p>
        </div>

        {/* Current Prices */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {cryptoOptions.map((crypto, index) => (
            <Card 
              key={crypto.id} 
              className="bg-glass/50 backdrop-blur-xl border-glass-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="text-muted-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                  {crypto.name}
                </div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {prices[crypto.id] 
                    ? `$${prices[crypto.id].toLocaleString(undefined, { maximumFractionDigits: 2 })}` 
                    : <span className="inline-block w-20 h-6 bg-muted rounded animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]" />
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8 space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className="bg-success/10 border border-success/50 rounded-lg p-4 flex items-center gap-3 animate-pulse-glow"
              >
                <Bell className="text-success shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate">{notif.message}</div>
                  <div className="text-success/80 text-sm">{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Add Alert Form */}
          <Card className="bg-glass/50 backdrop-blur-xl border-glass-border/30">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Lisa hoiatus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Krüptovaluuta</Label>
                <Select
                  value={newAlert.crypto}
                  onValueChange={(value) => setNewAlert({ ...newAlert, crypto: value })}
                >
                  <SelectTrigger className="bg-secondary border-border hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoOptions.map(crypto => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        {crypto.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Tingimus</Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(value: 'above' | 'below') => setNewAlert({ ...newAlert, condition: value })}
                >
                  <SelectTrigger className="bg-secondary border-border hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Kõrgem kui</SelectItem>
                    <SelectItem value="below">Madalam kui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Hind ($)</Label>
                <Input
                  type="number"
                  value={newAlert.price}
                  onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
                  placeholder="Sisesta siht-hind"
                  className="bg-secondary border-border hover:border-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <Button
                onClick={addAlert}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
              >
                <Bell className="mr-2 h-5 w-5" />
                Loo hoiatus
              </Button>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="bg-glass/50 backdrop-blur-xl border-glass-border/30">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                Aktiivsed hoiatused
                <span className="ml-auto text-sm font-normal text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {alerts.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {alerts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Hoiatusi pole veel lisatud</p>
                  </div>
                ) : (
                  alerts.map(alert => {
                    const crypto = getCryptoInfo(alert.crypto);
                    const currentPrice = prices[alert.crypto];
                    const isTriggered = alert.triggered;

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          isTriggered 
                            ? 'bg-success/10 border-success/50' 
                            : 'bg-secondary/50 border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-foreground font-bold flex items-center gap-2">
                              {crypto?.name}
                              {alert.condition === 'above' ? (
                                <TrendingUp className="text-success" size={16} />
                              ) : (
                                <TrendingDown className="text-destructive" size={16} />
                              )}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {alert.condition === 'above' ? 'Kõrgem kui' : 'Madalam kui'} ${alert.price.toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="text-destructive/70 hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        {currentPrice && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Praegune hind: </span>
                            <span className="text-foreground font-bold">
                              ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        
                        {isTriggered && (
                          <div className="mt-2 text-success text-sm font-bold flex items-center gap-1">
                            <span>✓</span> Hoiatus käivitatud!
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            Hinnad uuenevad iga 10 sekundi järel • Andmed: Binance API
          </p>
        </div>
      </div>
    </div>
  );
}
