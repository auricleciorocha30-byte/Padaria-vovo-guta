
import React from 'react';
import { StoreSettings } from '../types';
import { Switch } from '../components/Switch';
import { ShieldCheck, CheckCircle2, XCircle, Printer, Monitor, Smartphone } from 'lucide-react';

interface Props {
  settings: StoreSettings;
  onUpdateSettings: (s: StoreSettings) => void;
}

const WaitstaffManagement: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const togglePermission = (key: keyof StoreSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
          <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Permissões da Garçonete</h2>
            <p className="text-sm text-gray-500">Controle o que a equipe de atendimento pode fazer no tablet/celular.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PermissionCard 
            title="Finalizar Pedidos" 
            description="Permite que a garçonete marque pedidos como ENTREGUES no painel digital."
            icon={<CheckCircle2 className="text-green-500" />}
            checked={settings.canWaitstaffFinishOrder}
            onChange={() => togglePermission('canWaitstaffFinishOrder')}
          />
          
          <PermissionCard 
            title="Cancelar/Excluir Itens" 
            description="Permite que a garçonete remova itens do pedido ou cancele o pedido inteiro."
            icon={<XCircle className="text-red-500" />}
            checked={settings.canWaitstaffCancelItems}
            onChange={() => togglePermission('canWaitstaffCancelItems')}
          />
        </div>
      </div>

      <div className="bg-[#3d251e] p-8 rounded-[2.5rem] shadow-xl text-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg">
            <Printer size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Configuração de Impressão</h2>
            <p className="text-sm text-orange-200">Defina o padrão para a impressora térmica da cozinha/balcão.</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Tamanho do Papel</p>
              <p className="text-xs text-gray-400">Padrão da impressora térmica</p>
            </div>
            <div className="flex bg-white/10 p-1 rounded-xl">
              <button 
                onClick={() => onUpdateSettings({...settings, thermalPrinterWidth: '80mm'})}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${settings.thermalPrinterWidth === '80mm' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                80mm (Grande)
              </button>
              <button 
                onClick={() => onUpdateSettings({...settings, thermalPrinterWidth: '58mm'})}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${settings.thermalPrinterWidth === '58mm' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                58mm (Pequena)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
             <div className="flex items-center gap-3 text-orange-400 mb-2">
                <Monitor size={16} />
                <span className="text-sm font-bold">Estilo de Impressão</span>
             </div>
             <p className="text-xs text-gray-400">A impressão está configurada para <strong>Preto Total</strong>, otimizada para economia de bobina e máxima nitidez em papéis térmicos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionCard = ({ title, description, icon, checked, onChange }: { title: string, description: string, icon: React.ReactNode, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className={`p-6 rounded-3xl border-2 transition-all ${checked ? 'border-blue-100 bg-blue-50/30' : 'border-gray-50 bg-gray-50/50'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
    <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default WaitstaffManagement;
