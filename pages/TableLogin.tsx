
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, ChevronRight, AlertCircle, Check } from 'lucide-react';

interface Props {
  onLogin: (table: string) => void;
}

const TableLogin: React.FC<Props> = ({ onLogin }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    onLogin(selectedTable);
    navigate('/cardapio');
  };

  const tables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen bg-[#3d251e] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Hash size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#3d251e]">Olá! Seja bem-vindo.</h1>
          <p className="text-sm text-gray-400 px-4">Selecione o número da sua mesa abaixo para acessar o cardápio digital.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {tables.map(tableNum => (
              <button
                key={tableNum}
                type="button"
                onClick={() => setSelectedTable(tableNum)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-xl font-bold transition-all relative overflow-hidden ${
                  selectedTable === tableNum 
                  ? 'bg-[#f68c3e] text-white scale-105 shadow-lg shadow-orange-500/30' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {selectedTable === tableNum && (
                    <div className="absolute top-1 right-1">
                        <Check size={12} strokeWidth={4} />
                    </div>
                )}
                {tableNum}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
             <AlertCircle className="text-blue-500 shrink-0" size={18} />
             <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
               O seu pedido será enviado diretamente para a cozinha com o número da sua mesa vinculado. Certifique-se de estar na mesa correta.
             </p>
          </div>

          <button 
            type="submit"
            disabled={!selectedTable}
            className="w-full bg-[#3d251e] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Acessar Cardápio <ChevronRight />
          </button>
        </form>
        
        <div className="text-center pt-4">
           <img 
            src="https://images.tcdn.com.br/img/img_prod/1126742/1665494238_logo_vovo_guta_2.jpg" 
            className="w-16 h-16 mx-auto opacity-30 grayscale" 
            alt="Vovó Guta" 
          />
        </div>
      </div>
    </div>
  );
};

export default TableLogin;
