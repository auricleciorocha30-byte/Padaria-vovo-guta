
import React, { useMemo } from 'react';
import { Order, StoreSettings } from '../types';
import { ChefHat, CheckCircle2, Tv } from 'lucide-react';

interface Props {
  orders: Order[];
  settings: StoreSettings;
}

const TVBoard: React.FC<Props> = ({ orders, settings }) => {
  const preparing = useMemo(() => orders.filter(o => o.status === 'PREPARANDO').slice(0, 8), [orders]);
  const ready = useMemo(() => orders.filter(o => o.status === 'PRONTO').slice(0, 8), [orders]);

  return (
    <div className="min-h-screen bg-[#3d251e] text-white p-12 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <img src={settings.logoUrl} className="w-24 h-24 rounded-full border-4 border-[#f68c3e] shadow-xl" alt="Logo" />
          <div>
            <h1 className="text-5xl font-brand font-bold">{settings.storeName}</h1>
            <p className="text-2xl text-orange-400 uppercase tracking-widest font-medium">Status de Pedidos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-6xl font-bold">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xl text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
        </div>
      </header>

      {/* Boards */}
      <div className="flex-1 grid grid-cols-2 gap-12">
        {/* Preparing */}
        <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-10 text-orange-400">
            <ChefHat size={48} />
            <h2 className="text-4xl font-bold uppercase tracking-tight">Preparando...</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {preparing.map(order => (
              <div key={order.id} className="text-center p-6 bg-white/5 rounded-2xl animate-pulse">
                <span className="text-5xl font-bold text-gray-300">
                   #{order.tableNumber ? order.tableNumber : order.id.slice(-3).toUpperCase()}
                </span>
                <p className="text-sm mt-2 text-gray-500">{order.type}</p>
              </div>
            ))}
            {preparing.length === 0 && <p className="col-span-2 text-center text-gray-600 text-2xl py-12">Sem pedidos em preparo</p>}
          </div>
        </div>

        {/* Ready */}
        <div className="bg-[#f68c3e] rounded-[3rem] p-10 shadow-[0_0_100px_rgba(246,140,62,0.2)]">
          <div className="flex items-center gap-4 mb-10 text-white">
            <CheckCircle2 size={48} />
            <h2 className="text-4xl font-bold uppercase tracking-tight">Pronto! Retire Aqui</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {ready.map(order => (
              <div key={order.id} className="text-center p-8 bg-white text-[#3d251e] rounded-2xl shadow-2xl scale-110 animate-bounce">
                <span className="text-7xl font-bold">
                   {order.tableNumber ? order.tableNumber : order.id.slice(-3).toUpperCase()}
                </span>
                <p className="text-lg font-bold mt-2 opacity-50">{order.type}</p>
              </div>
            ))}
            {ready.length === 0 && <p className="col-span-2 text-center text-white/50 text-2xl py-12">Aguardando pedidos...</p>}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-gray-400 text-xl border-t border-white/10 pt-8 italic">
        "O melhor café da região feito com amor para você."
      </footer>
    </div>
  );
};

export default TVBoard;
