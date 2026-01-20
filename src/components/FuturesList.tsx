import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Yahoo sümbolid ja meie nimed
const ASSETS = [
  { symbol: "ES=F", name: "S&P 500", label: "ES" },
  { symbol: "NQ=F", name: "Nasdaq 100", label: "NQ" },
  { symbol: "GC=F", name: "Kuld (Gold)", label: "GC" },
  { symbol: "CL=F", name: "Nafta (Crude)", label: "CL" }, // Lisasin boonusena nafta ka
];

// Funktsioon, mis küsib Yahoo andmeid läbi "proxy" (et ei tekiks vigu)
const fetchFutures = async () => {
  const promises = ASSETS.map(async (asset) => {
    // Kasutame allorigins.win vahendajat, et browser lubaks Yahoo andmeid lugeda
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${asset.symbol}?interval=1d&range=1d`
    )}`;
    
    const res = await fetch(url);
    const data = await res.json();
    const yahooData = JSON.parse(data.contents);
    
    // Yahoo andmestruktuur on keeruline, kaevame hinna välja
    const price = yahooData.chart.result[0].meta.regularMarketPrice;
    const prevClose = yahooData.chart.result[0].meta.chartPreviousClose;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      ...asset,
      price,
      changePercent,
    };
  });

  return Promise.all(promises);
};

const FuturesList = () => {
  const { data: futures, isLoading } = useQuery({
    queryKey: ["futures"],
    queryFn: fetchFutures,
    refetchInterval: 60000 * 15, // Uuenda iga 15 minuti tagant
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white"> Futuurid - 15min viide </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {futures?.map((item) => (
          <Card key={item.symbol} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">
                {item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className={`text-sm font-medium mt-1 ${item.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {item.changePercent > 0 ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FuturesList;
