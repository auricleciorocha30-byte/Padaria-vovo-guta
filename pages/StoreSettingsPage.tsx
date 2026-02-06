
import React, { useRef, useState } from 'react';
import { StoreSettings } from '../types';
import { Switch } from '../components/Switch';
import { 
  Save, 
  Image as ImageIcon, 
  Palette, 
  Camera, 
  Upload, 
  Trash2, 
  Globe,
  Store,
  Truck,
  UtensilsCrossed,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';

interface Props {
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
}

const StoreSettingsPage: React.FC<Props> = ({ settings, setSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        alert("A imagem é muito grande. Escolha uma imagem de até 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalSettings({ ...localSettings, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setSettings(localSettings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header com Ação de Salvar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-brand font-bold text-gray-800">Identidade & Configurações</h1>
          <p className="text-gray-500">Gerencie a aparência e as regras de funcionamento da sua loja.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#3d251e] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 size={20} />
          Configurações atualizadas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Identidade Visual */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Logotipo</h2>
            
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-40 h-40 rounded-full border-4 border-orange-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner relative">
                {localSettings.logoUrl ? (
                  <img src={localSettings.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={32} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 mb-4">Recomendado: 512x512px (PNG ou JPG)</p>
              <button 
                onClick={() => setLocalSettings({ ...localSettings, logoUrl: 'https://images.tcdn.com.br/img/img_prod/1126742/1665494238_logo_vovo_guta_2.jpg' })}
                className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> Restaurar Padrão
              </button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Palette size={16} /> Cores da Marca
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={localSettings.primaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-sm text-gray-600 uppercase">{localSettings.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={localSettings.secondaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-sm text-gray-600 uppercase">{localSettings.secondaryColor}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna de Configurações da Loja */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Store size={18} /> Dados da Unidade
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Nome Comercial</span>
                <input 
                  type="text" 
                  value={localSettings.storeName}
                  onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  placeholder="Ex: Vovó Guta Matriz"
                />
              </label>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
              <Globe size={18} /> Canais de Venda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border-2 transition-all ${localSettings.isTableOrderActive ? 'border-orange-100 bg-orange-50/20' : 'border-gray-50 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500">
                    <UtensilsCrossed size={24} />
                  </div>
                  <Switch 
                    checked={localSettings.isTableOrderActive} 
                    onChange={(v) => setLocalSettings({ ...localSettings, isTableOrderActive: v })} 
                  />
                </div>
                <h3 className="font-bold text-gray-800">Pedido em Mesa</h3>
                <p className="text-[10px] text-gray-500 mt-1">QR Code e Tablets</p>
              </div>

              <div className={`p-6 rounded-3xl border-2 transition-all ${localSettings.isCounterPickupActive ? 'border-green-100 bg-green-50/20' : 'border-gray-50 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-green-500">
                    <ShoppingBag size={24} />
                  </div>
                  <Switch 
                    checked={localSettings.isCounterPickupActive} 
                    onChange={(v) => setLocalSettings({ ...localSettings, isCounterPickupActive: v })} 
                  />
                </div>
                <h3 className="font-bold text-gray-800">Retirada Balcão</h3>
                <p className="text-[10px] text-gray-500 mt-1">Vendas presenciais</p>
              </div>

              <div className={`p-6 rounded-3xl border-2 transition-all ${localSettings.isDeliveryActive ? 'border-blue-100 bg-blue-50/20' : 'border-gray-50 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500">
                    <Truck size={24} />
                  </div>
                  <Switch 
                    checked={localSettings.isDeliveryActive} 
                    onChange={(v) => setLocalSettings({ ...localSettings, isDeliveryActive: v })} 
                  />
                </div>
                <h3 className="font-bold text-gray-800">Delivery</h3>
                <p className="text-[10px] text-gray-500 mt-1">Entrega em domicílio</p>
              </div>
            </div>
          </section>

          <div className="bg-[#3d251e] p-8 rounded-[2.5rem] shadow-xl text-white">
            <h2 className="text-lg font-bold mb-4">Dica de Experiência</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Mantenha o logotipo em alta resolução para que ele apareça nítido no Painel TV e no Cardápio Digital dos clientes. 
              As cores selecionadas acima influenciam os botões e destaques visuais do seu sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettingsPage;
