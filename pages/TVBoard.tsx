
import React, { useMemo, useEffect, useState } from 'react';
import { Order, StoreSettings, Product } from '../types';
import { ChefHat, CheckCircle2, Tv, Flame, Star, Calendar, ShoppingBag, Truck, Utensils } from 'lucide-react';

interface Props {
  orders: Order[];
  settings: StoreSettings;
  products: Product[];
}

const TVBoard: React.FC<Props> = ({ orders, settings, products }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { preparing, ready } = useMemo(() => {
    const active = orders.filter(o => o.status === 'PREPARANDO' || o.status === 'PRONTO');
    
    const prepList: { label: string, type: string }[] = [];
    const readyList: { label: string, type: string }[] = [];

    active.forEach(o => {
      let label = '';
      if (o.type === 'MESA') label = `MESA ${o.tableNumber}`;
      else if (o.type === 'BALCAO') label = o.customerName ? o.customerName.split(' ')[0] : `#${o.id}`;
      else label = `DELIVERY #${o.id.slice(-3)}`;

      const item = { label, type: o.type };
      if (o.status === 'PREPARANDO') prepList.push(item);
      else readyList.push(item);
    });

    // Remove duplicatas por rótulo para evitar ruído visual
    const uniquePrep = Array.from(new Map(prepList.map(item => [item.label, item])).values());
    const uniqueReady = Array.from(new Map(readyList.map(item => [item.label, item])).values());

    return {
      preparing: uniquePrep.slice(0, 12),
      ready: uniqueReady.slice(0, 8)
    };
  }, [orders]);
  
  const today = currentTime.getDay();
  const todayOffer = useMemo(() => products.find(p => p.featuredDay === today && p.isActive), [products, today]);

  return (
    <div className="min-h-screen bg-[#3d251e] text-white p-8 overflow-hidden flex flex-col">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-6">
          <img src={settings.logoUrl} className="w-20 h-20 rounded-full border-4 border-[#f68c3e] shadow-xl" />
          <div>
            <h1 className="text-4xl font-brand font-bold">{settings.storeName}</h1>
            <p className="text-lg text-orange-400 uppercase tracking-widest font-medium">Painel de Atendimento</p>
          </div>
        </div>
        <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
          <p className="text-4xl font-bold font-mono">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8">
        <div className="col-span-8 grid grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 flex flex-col">
            <div className="flex items-center gap-4 mb-8 text-orange-400">
              <ChefHat size={32} />
              <h2 className="text-2xl font-bold uppercase">Preparando</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {preparing.length === 0 ? <p className="col-span-2 text-center text-white/20 italic">Aguardando pedidos...</p> : 
                preparing.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 animate-pulse">
                    <span className="text-2xl font-bold uppercase">{item.label}</span>
                    <div className="opacity-40">
                        {item.type === 'MESA' ? <Utensils size={18}/> : item.type === 'ENTREGA' ? <Truck size={18}/> : <ShoppingBag size={18}/>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-[#f68c3e] rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
            <div className="flex items-center gap-4 mb-8 text-white">
              <CheckCircle2 size={32} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Pronto para Retirar</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {ready.length === 0 ? <p className="text-center text-white/50 italic">Saindo pedidos deliciosos...</p> : 
                ready.map((item, idx) => (
                  <div key={idx} className="p-6 bg-white text-[#3d251e] rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
                    <span className="text-5xl font-black uppercase tracking-tight">{item.label}</span>
                    <div className="text-orange-500">
                        {item.type === 'MESA' ? <Utensils size={32}/> : item.type === 'ENTREGA' ? <Truck size={32}/> : <ShoppingBag size={32}/>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="col-span-4 h-full">
          <div className="bg-gradient-to-b from-yellow-500 to-orange-600 rounded-[2.5rem] p-1 shadow-2xl h-full">
            <div className="bg-[#3d251e]/90 rounded-[2.3rem] h-full p-8 flex flex-col items-center text-center">
              <div className="bg-yellow-400 text-[#3d251e] px-6 py-2 rounded-full font-bold text-sm uppercase mb-6 flex items-center gap-2">
                <Flame size={18} fill="currentColor" /> Destaque de Hoje
              </div>
              {todayOffer ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <img src={todayOffer.imageUrl} className="w-full aspect-square object-cover rounded-[2rem] shadow-2xl border-4 border-yellow-400/20" />
                  <div>
                    <h3 className="text-3xl font-brand font-bold text-yellow-400 mb-2">{todayOffer.name}</h3>
                    <p className="text-5xl font-bold text-white">R$ {todayOffer.price.toFixed(2)}</p>
                  </div>
                </div>
              ) : <div className="flex-1 flex flex-col justify-center text-white/20"><Star size={64} className="mx-auto mb-4"/></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVBoard;
