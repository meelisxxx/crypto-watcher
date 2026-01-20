import CryptoPriceAlerts from "@/components/CryptoPriceAlerts";
import FuturesList from "@/components/FuturesList"; // <-- Uus rida

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Futuurid kõige üleval */}
        <FuturesList />
        
        {/* Sinu vana krüpto osa */}
        <CryptoPriceAlerts />
        
      </div>
    </div>
  );
};

export default Index;
