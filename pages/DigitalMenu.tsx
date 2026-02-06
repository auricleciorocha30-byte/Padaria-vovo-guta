
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, X, ChevronLeft, Trash2, Plus as PlusIcon, CheckCircle, Loader2, Search, Clock, Star, Weight, Ban } from 'lucide-react';
import { Product, StoreSettings, Order, OrderItem, OrderType, PaymentMethod } from '../types';

interface Props {
  products: Product[];
  categories: string[];
  settings: StoreSettings;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  tableNumber: string | null;
  onLogout: () => void;
  isWaitstaff?: boolean;
}

const DigitalMenu: React.FC<Props> = ({ products, categories: externalCategories, settings, addOrder, tableNumber: initialTable, onLogout, isWaitstaff = false }) => {
  const [searchParams] = useSearchParams();
  const urlTable = searchParams.get('mesa');
  
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [selectedWeightGrams, setSelectedWeightGrams] = useState<string>("100");

  const effectiveTable = initialTable || urlTable || null;
  const [orderType, setOrderType] = useState<OrderType>(effectiveTable ? 'MESA' : 'BALCAO');
  const [manualTable, setManualTable] = useState(effectiveTable || '');
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const isStoreOpen = useMemo(() => settings.isDeliveryActive || settings.isTableOrderActive || settings.isCounterPickupActive, [settings]);

  const todayOffer = useMemo(() => {
    const today = new Date().getDay();
    return products.find(p => p.featuredDay === today && p.isActive);
  }, [products]);

  const categories = useMemo(() => ['Todos', ...externalCategories], [externalCategories]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);
  
  const handleAddToCart = (product: Product, quantityOverride?: number) => {
    if (!product.isActive || !isStoreOpen) return;

    if (product.isByWeight && quantityOverride === undefined) {
        setWeightProduct(product);
        setSelectedWeightGrams("100");
        return;
    }

    const finalQuantity = quantityOverride !== undefined ? quantityOverride : 1;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + finalQuantity } : item);
      }
      return [...prev, { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: finalQuantity,
          isByWeight: !!product.isByWeight 
      }];
    });

    setWeightProduct(null);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (orderType === 'MESA' && !manualTable) { alert('Informe o número da mesa.'); return; }
    if (orderType === 'ENTREGA' && (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim())) { alert('Preencha os campos obrigatórios.'); return; }
    
    setIsSending(true);
    const finalOrder: Order = {
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      type: isWaitstaff ? 'MESA' : orderType, 
      items: cart,
      status: 'PREPARANDO',
      total: cartTotal,
      createdAt: Date.now(),
      paymentMethod: payment,
      notes: notes.trim() || undefined,
      tableNumber: manualTable || undefined,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      deliveryAddress: deliveryAddress.trim() || undefined
    };

    try {
        await addOrder(finalOrder);
        setCart([]);
        setCheckoutStep('success');
    } catch (err: any) {
        alert(`Erro: ${err.message}`);
    } finally {
        setIsSending(false);
    }
  };

  const currentWeightInput = parseInt(selectedWeightGrams) || 0;

  return (
    <div className="min-h-screen bg-[#fff5e1] text-[#3d251e]">
      <header className={`sticky top-0 z-20 shadow-lg ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} text-white p-6`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={24} /></button>
            <img src={settings.logoUrl} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="Logo" />
            <div className="flex flex-col">
                <h1 className="font-brand text-lg font-bold leading-none">{isWaitstaff ? 'Painel Equipe' : settings.storeName}</h1>
            </div>
          </div>
          <button onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }} className="relative p-2 bg-white/10 rounded-full">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-20">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input type="text" placeholder="O que você procura hoje?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl outline-none shadow-sm" />
        </div>

        {todayOffer && activeCategory === 'Todos' && !searchTerm && (
          <div className="relative overflow-hidden bg-[#3d251e] rounded-[2.5rem] p-6 flex flex-col sm:flex-row gap-6 items-center shadow-2xl">
              <div className="relative w-full sm:w-40 aspect-square shrink-0">
                <img src={todayOffer.imageUrl} className="w-full h-full object-cover rounded-3xl" alt={todayOffer.name} />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-[#3d251e] px-3 py-1 rounded-full font-black text-[9px] uppercase shadow-lg flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Oferta de Hoje
                </div>
              </div>
              <div className="flex-1 text-white text-center sm:text-left">
                <h2 className="text-2xl font-brand font-bold text-orange-400">{todayOffer.name}</h2>
                <p className="text-xs text-gray-300 mt-1">{todayOffer.description}</p>
                <div className="flex items-center justify-between sm:justify-start gap-4 mt-4">
                  <span className="text-3xl font-bold">R$ {todayOffer.price.toFixed(2)} {todayOffer.isByWeight ? '/ KG' : ''}</span>
                  <button onClick={() => handleAddToCart(todayOffer)} className="px-6 py-3 bg-[#f68c3e] text-white rounded-2xl font-bold flex items-center gap-2">
                    <PlusIcon size={18} /> Adicionar
                  </button>
                </div>
              </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm border transition-all ${activeCategory === cat ? 'bg-[#3d251e] text-white border-[#3d251e]' : 'bg-white text-gray-400 border-gray-100'}`}>{cat}</button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-[2rem] p-4 shadow-sm flex gap-4 items-center border border-gray-50 transition-all ${!product.isActive ? 'opacity-50 grayscale' : ''}`}>
              <img src={product.imageUrl} className="w-20 h-20 object-cover rounded-2xl" alt={product.name} />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-600">R$ {product.price.toFixed(2)} {product.isByWeight ? '/ KG' : ''}</span>
                  {product.isActive ? (
                    <button onClick={() => handleAddToCart(product)} className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}>
                      <PlusIcon size={20} />
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1 uppercase">
                        <Ban size={10} /> Indisponível
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {weightProduct && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 space-y-6 text-center shadow-2xl">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Weight size={40} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{weightProduct.name}</h2>
                    <p className="text-xs text-gray-400">Quanto você deseja? (Peso em Gramas)</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200">
                    <div className="relative w-full">
                        <input type="number" autoFocus value={selectedWeightGrams} onChange={(e) => setSelectedWeightGrams(e.target.value)} className="w-full bg-white text-center text-4xl font-black text-[#3d251e] p-4 rounded-2xl outline-none" placeholder="0" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">g</span>
                    </div>
                </div>
                <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-widest">Valor Aproximado</p>
                    <p className="text-4xl font-black text-orange-600">R$ {((weightProduct.price * currentWeightInput) / 1000).toFixed(2)}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setWeightProduct(null)} className="flex-1 py-4 text-gray-400 font-bold">Cancelar</button>
                    <button disabled={currentWeightInput <= 0} onClick={() => handleAddToCart(weightProduct, currentWeightInput / 1000)} className="flex-1 py-4 bg-[#3d251e] text-white rounded-2xl font-bold shadow-xl">Adicionar</button>
                </div>
            </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            {checkoutStep !== 'success' && (
              <div className="p-8 border-b flex items-center justify-between bg-gray-50">
                <h2 className="font-bold text-xl">{checkoutStep === 'cart' ? 'Sua Sacola' : 'Finalizar Pedido'}</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400"><X size={24} /></button>
              </div>
            )}
            <div className="flex-1 overflow-auto p-8 space-y-6 custom-scrollbar">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.length === 0 ? <div className="py-10 text-center text-gray-400 italic">Sua sacola está vazia...</div> : 
                    cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                        <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase">
                                    {item.isByWeight ? `${(item.quantity * 1000).toFixed(0)}g` : `${item.quantity} UN`}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">• R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="p-3 text-red-300 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>
                    ))
                  }
                  {cart.length > 0 && (
                    <div className="pt-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 mb-1 block">Observações</label>
                      <textarea placeholder="Ex: Sem cebola..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-1 focus:ring-orange-500 min-h-[80px]" />
                    </div>
                  )}
                </div>
              )}
              {checkoutStep === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2">
                      {settings.isTableOrderActive && <button onClick={() => setOrderType('MESA')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'MESA' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-400'}`}>MESA</button>}
                      {settings.isCounterPickupActive && <button onClick={() => setOrderType('BALCAO')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'BALCAO' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-400'}`}>BALCÃO</button>}
                      {settings.isDeliveryActive && <button onClick={() => setOrderType('ENTREGA')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'ENTREGA' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-400'}`}>ENTREGA</button>}
                  </div>
                  <div className="space-y-4">
                    {orderType === 'MESA' && <input type="text" placeholder="Número da Mesa" value={manualTable} onChange={e => setManualTable(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" />}
                    {(orderType === 'ENTREGA' || orderType === 'BALCAO') && (
                      <div className="space-y-4">
                        <input type="text" placeholder="Seu Nome *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" />
                        <input type="tel" placeholder="WhatsApp / Telefone *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" />
                      </div>
                    )}
                    {orderType === 'ENTREGA' && <textarea placeholder="Endereço Completo *" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none min-h-[100px]" />}
                  </div>
                </div>
              )}
              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce shadow-inner">
                      <CheckCircle size={56} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#3d251e]">Pedido Enviado!</h2>
                      <p className="text-gray-500 max-w-xs mx-auto">Seu pedido já está em nossa cozinha. Acompanhe pelo painel da loja.</p>
                    </div>
                    <button onClick={() => { setCart([]); setCheckoutStep('cart'); setIsCartOpen(false); onLogout(); }} className="w-full py-5 bg-[#3d251e] text-white rounded-3xl font-bold shadow-xl active:scale-95 transition-transform">Finalizar e Sair</button>
                </div>
              )}
            </div>
            {checkoutStep !== 'success' && (
              <div className="p-8 bg-gray-50 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Geral</span>
                  <span className="text-4xl font-brand font-bold text-[#3d251e]">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                    {checkoutStep === 'details' && <button onClick={() => setCheckoutStep('cart')} className="px-6 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-black"><ChevronLeft/></button>}
                    <button disabled={cart.length === 0 || isSending} onClick={() => checkoutStep === 'cart' ? (isWaitstaff ? handleCheckout() : setCheckoutStep('details')) : handleCheckout()} className={`flex-1 py-5 rounded-3xl font-bold text-white shadow-xl active:scale-95 transition-transform ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} disabled:opacity-30`}>
                      {isSending ? <Loader2 className="animate-spin"/> : checkoutStep === 'cart' ? 'Continuar' : 'Enviar Pedido'}
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalMenu;
