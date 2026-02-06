
import React from 'react';
import { StoreSettings } from '../types';
import { Switch } from '../components/Switch';
import { Save, Image as ImageIcon, Palette } from 'lucide-react';

interface Props {
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
}

const StoreSettingsPage: React.FC<Props> = ({ settings, setSettings }) => {
  const handleChange = (key: keyof StoreSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Service Toggles */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Save size={20} className="text-orange-500" /> Ativar/Desativar Serviços
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold">Entrega</p>
              <p className="text-xs text-gray-500">Delivery domiciliar</p>
            </div>
            <Switch 
              checked={settings.isDeliveryActive} 
              onChange={(v) => handleChange('isDeliveryActive', v)} 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold">Pedidos em Mesa</p>
              <p className="text-xs text-gray-500">QR Code e Cardápio</p>
            </div>
            <Switch 
              checked={settings.isTableOrderActive} 
              onChange={(v) => handleChange('isTableOrderActive', v)} 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold">Retirada Balcão</p>
              <p className="text-xs text-gray-500">Pedido pronto no local</p>
            </div>
            <Switch 
              checked={settings.isCounterPickupActive} 
              onChange={(v) => handleChange('isCounterPickupActive', v)} 
            />
          </div>
        </div>
      </div>

      {/* Visual Identity */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Palette size={20} className="text-orange-500" /> Identidade Visual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo (URL)</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={settings.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"><ImageIcon size={20}/></button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-8">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer overflow-hidden border-none"
                  />
                  <span className="text-sm font-mono">{settings.primaryColor}</span>
                </div>
               </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer overflow-hidden border-none"
                  />
                  <span className="text-sm font-mono">{settings.secondaryColor}</span>
                </div>
               </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-800">Dica: Use as cores originais da logomarca Vovó Guta (#3D251E e #F68C3E) para manter a consistência da marca.</p>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full py-4 bg-[#3d251e] text-white font-bold rounded-2xl hover:bg-black transition-colors shadow-lg">
        Salvar Todas as Configurações
      </button>
    </div>
  );
};

export default StoreSettingsPage;
