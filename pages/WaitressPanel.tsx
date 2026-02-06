
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, UserRound, ArrowRight, Utensils, Clock, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';

interface Props {
  onSelectTable: (table: string) => void;
  orders: Order[];
}

const WaitressPanel: React.FC<Props> = ({ onSelectTable, orders }) => {
  const navigate = useNavigate();
  const tables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Identifica mesas com pedidos ativos (Preparando ou Pronto)
  const occupiedTables = useMemo(() => {
    const map = new Map<string, { status: string, count: number }>();
    orders.forEach(o => {
      if (o.tableNumber && (o.status === 'PREPARANDO' || o.status === 'PRONTO')) {
        const current = map.get(o.tableNumber);
        if (!current || o.status === 'PRONTO') { // Prioriza mostrar 'PRONTO' se houver
            map.set(o.tableNumber, { 
                status: o.status, 
                count: (current?.count || 0) + 1 
            });
        }
      }
    });
    return map;
  }, [orders]);

  const handleTableClick = (tableNum: string) => {
    onSelectTable(tableNum);
    navigate('/cardapio');
  };

  return (
    <div className="min-h-screen bg-[#3d251e] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between text-white border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-500 rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-white animate-bounce-slow">
              <UserRound size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-brand font-bold tracking-tight">Painel de Atendimento</h1>
              <p className="text-orange-400 text-sm font-medium flex items-center gap-2">
                <Clock size={14} /> Selecione uma mesa para lançar pedidos
              </p>
            </div>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <p className="text-2xl font-bold font-mono">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(tableNum => {
            const occupation = occupiedTables.get(tableNum);
            const isReady = occupation?.status === 'PRONTO';
            const isPreparing = occupation?.status === 'PREPARANDO';

            return (
              <button
                key={tableNum}
                onClick={() => handleTableClick(tableNum)}
                className={`relative overflow-hidden aspect-square rounded-[2rem] p-6 text-center transition-all border-2 flex flex-col items-center justify-center group active:scale-95 ${
                    isReady ? 'bg-green-600 border-green-400 shadow-lg shadow-green-900/40' :
                    isPreparing ? 'bg-orange-600 border-orange-400 shadow-lg shadow-orange-900/40' :
                    'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {isReady && (
                    <div className="absolute top-3 right-3 animate-ping">
                        <CheckCircle2 size={16} className="text-white" />
                    </div>
                )}
                
                <Hash size={16} className={`mb-1 ${occupation ? 'text-white/60' : 'text-orange-400'}`} />
                <span className="text-5xl font-bold text-white block mb-2">{tableNum}</span>
                
                <div className="mt-1">
                    {isReady ? (
                        <span className="text-[10px] font-black bg-white text-green-700 px-2 py-0.5 rounded-full uppercase">Pronto</span>
                    ) : isPreparing ? (
                        <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">Em Preparo</span>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-orange-400">Livre</span>
                    )}
                </div>

                {occupation && (
                    <div className="absolute bottom-3 text-[9px] text-white/50 font-bold">
                        {occupation.count} {occupation.count === 1 ? 'PEDIDO' : 'PEDIDOS'}
                    </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white"><CheckCircle2 size={24}/></div>
                <div><p className="text-white font-bold">Pronto</p><p className="text-xs text-gray-400">Levar para a mesa imediatamente</p></div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white"><Utensils size={24}/></div>
                <div><p className="text-white font-bold">Em Preparo</p><p className="text-xs text-gray-400">Pedido está na cozinha</p></div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white"><ArrowRight size={24}/></div>
                <div><p className="text-white font-bold">Livre</p><p className="text-xs text-gray-400">Mesa disponível para novos clientes</p></div>
            </div>
        </div>

        <footer className="text-center pt-12">
           <button onClick={() => navigate('/')} className="text-white/20 hover:text-white/60 text-xs font-bold uppercase tracking-[0.2em] transition-colors">Voltar ao Painel Administrativo</button>
        </footer>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default WaitressPanel;
