
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, UserRound, ArrowRight } from 'lucide-react';

interface Props {
  onSelectTable: (table: string) => void;
}

const WaitressPanel: React.FC<Props> = ({ onSelectTable }) => {
  const navigate = useNavigate();
  const tables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const handleTableClick = (tableNum: string) => {
    onSelectTable(tableNum);
    navigate('/cardapio');
  };

  return (
    <div className="min-h-screen bg-[#3d251e] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between text-white border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
              <UserRound size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-brand font-bold">Painel da Garçonete</h1>
              <p className="text-orange-400 text-sm">Selecione uma mesa para realizar o atendimento</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {tables.map(tableNum => (
            <button
              key={tableNum}
              onClick={() => handleTableClick(tableNum)}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center hover:bg-orange-500 transition-all hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
              <Hash size={24} className="mx-auto mb-2 text-orange-400 group-hover:text-white" />
              <span className="text-4xl font-bold text-white block mb-2">{tableNum}</span>
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">
                Atender <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>

        <footer className="text-center pt-8 border-t border-white/10">
          <img 
            src="https://images.tcdn.com.br/img/img_prod/1126742/1665494238_logo_vovo_guta_2.jpg" 
            className="w-20 h-20 mx-auto opacity-20 grayscale" 
            alt="Logo Vovó Guta" 
          />
        </footer>
      </div>
    </div>
  );
};

export default WaitressPanel;
