
import React, { useMemo, useEffect, useState } from 'react';
import { Order, StoreSettings, Product } from '../types';
import { ChefHat, CheckCircle2, Tv, Flame, Star, Calendar } from 'lucide-react';

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

  // Agrupamento para TV: Somente IDs únicos de mesas ou pedidos
  const { preparing, ready } = useMemo(() => {
    const active = orders.filter(o => o.status === 'PREPARANDO' || o.status === 'PRONTO');
    
    const prepMap = new Set<string>();
    const readyMap = new Set<string>();

    active.forEach(o => {
      const label = o.tableNumber ? `MESA ${o.tableNumber}` : `#${o.id.slice(-3).toUpperCase()}`;
      if (o.status === 'PREPARANDO') prepMap.add(label);
      if (o.status === 'PRONTO') readyMap.add(label);
    });

    // Se uma mesa está pronta em algum pedido, ela não deve aparecer em preparando se possível (limpeza visual)
    readyMap.forEach(label => prepMap.delete(label));

    return {
      preparing: Array.from(prepMap).slice(0, 10),
      ready: Array.from(readyMap).slice(0, 6)
    };
  }, [orders]);
  
  const today = currentTime.getDay();
  const todayOffer = useMemo(() => products.find(p => p.featuredDay === today && p.isActive), [products, today]);

  return (
    <div className="min-h-screen bg-[#3d251e] text-white p-8 overflow-hidden flex flex-col">
      {/* Header com Relógio e Logo */}
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-6">
          <img src={settings.logoUrl} className="w-20 h-20 rounded-full border-4 border-[#f68c3e] shadow-xl" alt="Logo" />
          <div>
            <h1 className="text-4xl font-brand font-bold">{settings.storeName}</h1>
            <p className="text-lg text-orange-400 uppercase tracking-widest font-medium">Painel de Atendimento</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
            <p className="text-4xl font-bold font-mono">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs text-gray-400 uppercase tracking-tighter text-center">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Lado Esquerdo: Pedidos (8 colunas) */}
        <div className="col-span-8 grid grid-cols-2 gap-8">
          {/* Preparando */}
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 flex flex-col">
            <div className="flex items-center gap-4 mb-8 text-orange-400">
              <ChefHat size={32} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Preparando</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {preparing.length === 0 ? (
                <p className="col-span-2 text-center text-white/20 italic py-10">Aguardando novos pedidos...</p>
              ) : (
                preparing.map(label => (
                  <div key={label} className="p-4 bg-white/5 rounded-2xl text-center border border-white/5 animate-pulse">
                    <span className="text-4xl font-bold text-gray-200">{label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pronto */}
          <div className="bg-[#f68c3e] rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
            <div className="flex items-center gap-4 mb-8 text-white">
              <CheckCircle2 size={32} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Pronto</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {ready.length === 0 ? (
                <p className="text-center text-white/50 italic py-10">Cozinha a todo vapor!</p>
              ) : (
                ready.map(label => (
                  <div key={label} className="p-6 bg-white text-[#3d251e] rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                    <span className="text-6xl font-bold">{label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Oferta do Dia */}
        <div className="col-span-4 space-y-8">
          <div className="bg-gradient-to-b from-yellow-500 to-orange-600 rounded-[2.5rem] p-1 shadow-2xl h-full">
            <div className="bg-[#3d251e]/90 rounded-[2.3rem] h-full p-8 flex flex-col items-center text-center">
              <div className="bg-yellow-400 text-[#3d251e] px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Flame size={18} fill="currentColor" /> Oferta de Hoje
              </div>
              
              {todayOffer ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center w-full">
                  <div className="relative group">
                    <img src={todayOffer.imageUrl} className="w-full aspect-square object-cover rounded-[2rem] shadow-2xl border-4 border-yellow-400/20" alt="Oferta" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#3d251e] px-4 py-1 rounded-full font-bold shadow-lg text-xs">
                      {todayOffer.category}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-brand font-bold text-yellow-400 leading-tight mb-2">{todayOffer.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 px-4">{todayOffer.description}</p>
                    <div className="inline-block bg-white/10 px-8 py-4 rounded-3xl border border-white/10">
                      <span className="text-xs text-gray-500 block uppercase font-bold">Por apenas</span>
                      <span className="text-5xl font-bold text-white">R$ {todayOffer.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Star size={64} className="mb-4 opacity-20" />
                  <p>Confira nossas ofertas no balcão!</p>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-white/10 w-full">
                <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Vovó Guta Padaria</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVBoard;
