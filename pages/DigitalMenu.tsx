
import React, { useState, useMemo } from 'react';
import { ShoppingCart, X, ChevronLeft, Trash2, Plus as PlusIcon, CheckCircle, Loader2, Send, Search, LayoutGrid, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
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

const DigitalMenu: React.FC<Props> = ({ products, categories: externalCategories, settings, orders, addOrder, tableNumber, onLogout, isWaitstaff = false }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? 'MESA' : 'BALCAO');
  const [manualTable, setManualTable] = useState(tableNumber || '');
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Verifica se a loja está aberta (pelo menos um canal ativo)
  const isStoreOpen = useMemo(() => {
    return settings.isDeliveryActive || settings.isTableOrderActive || settings.isCounterPickupActive;
  }, [settings]);

  const categories = useMemo(() => ['Todos', ...externalCategories], [externalCategories]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);
  
  const addToCart = (product: Product) => {
    if (!product.isActive || !isStoreOpen) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (orderType === 'MESA' && !manualTable && !tableNumber) { alert('Informe a mesa'); return; }
    
    setIsSending(true);
    
    const finalOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: isWaitstaff ? 'MESA' : (orderType || 'BALCAO'), 
      items: cart,
      status: 'PREPARANDO',
      total: cartTotal,
      createdAt: Date.now(),
      paymentMethod: payment,
      notes: notes.trim() || undefined,
      tableNumber: tableNumber || manualTable || undefined
    };

    try {
        await addOrder(finalOrder);
        setCart([]);
        setCheckoutStep('success');
    } catch (err: any) {
        console.error("Erro no checkout:", err);
        alert(`❌ Falha ao enviar: ${err.message || 'Erro de conexão no banco'}`);
    } finally {
        setIsSending(false);
    }
  };

  // Se a loja estiver fechada e não for acesso de funcionário (garçom)
  if (!isStoreOpen && !isWaitstaff) {
    return (
      <div className="min-h-screen bg-[#fff5e1] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
            <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover grayscale opacity-50" />
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-md border border-orange-100">
            <Clock size={64} className="text-orange-500 mx-auto mb-6" />
            <h1 className="text-3xl font-brand font-bold text-[#3d251e] mb-4">Loja Fechada</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
                No momento não estamos aceitando novos pedidos. Por favor, verifique nosso horário de funcionamento ou entre em contato.
            </p>
            <button 
                onClick={onLogout}
                className="w-full py-4 bg-[#3d251e] text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all"
            >
                Voltar ao Início
            </button>
        </div>
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest font-bold">{settings.storeName}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5e1] text-[#3d251e]">
      <header className={`sticky top-0 z-20 shadow-lg ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} text-white p-6`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
            <img src={settings.logoUrl} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" alt="Logo" />
            <div className="flex flex-col">
                <h1 className="font-brand text-lg font-bold leading-none">{isWaitstaff ? 'Painel Garçom' : settings.storeName}</h1>
                <span className="text-[10px] opacity-70 uppercase tracking-widest mt-1">
                    {tableNumber ? `Mesa ${tableNumber}` : 'Cardápio Digital'}
                </span>
            </div>
          </div>
          <button onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }} className="relative p-2 bg-white/10 rounded-full">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-20">
        {!isStoreOpen && isWaitstaff && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center gap-3 text-orange-800 text-sm font-bold animate-pulse">
                <AlertTriangle size={20} />
                MODO ADMIN: Loja está fechada para clientes externos.
            </div>
        )}

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" size={22} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none shadow-sm font-medium transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} 
                className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm border transition-all ${activeCategory === cat ? 'bg-[#3d251e] text-white border-[#3d251e]' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                {cat}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm flex gap-4 items-center border border-gray-50 hover:border-orange-100 transition-colors">
              <img src={product.imageUrl} className="w-20 h-20 object-cover rounded-2xl" alt={product.name} />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-600">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}>
                    <PlusIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slide-up">
            
            {checkoutStep !== 'success' && (
              <div className="p-8 border-b flex items-center justify-between">
                <h2 className="font-bold text-xl">{checkoutStep === 'cart' ? 'Sacola de Pedidos' : 'Detalhes do Pedido'}</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>
            )}

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 italic">Sua sacola está vazia</div>
                  ) : (
                      cart.map(item => (
                        <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                          <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                          <button onClick={() => removeFromCart(item.productId)} className="text-red-300 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                      ))
                  )}
                  {cart.length > 0 && (
                      <textarea placeholder="Observações (opcional)..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500" />
                  )}
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-6">
                   {!isWaitstaff && (
                    <div className="grid grid-cols-3 gap-2">
                        {settings.isTableOrderActive && (
                            <button onClick={() => setOrderType('MESA')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'MESA' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50'}`}>
                                MESA
                            </button>
                        )}
                        {settings.isCounterPickupActive && (
                            <button onClick={() => setOrderType('BALCAO')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'BALCAO' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50'}`}>
                                BALCÃO
                            </button>
                        )}
                        {settings.isDeliveryActive && (
                            <button onClick={() => setOrderType('ENTREGA')} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === 'ENTREGA' ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50'}`}>
                                ENTREGA
                            </button>
                        )}
                    </div>
                  )}
                  {orderType === 'MESA' && !tableNumber && <input type="text" placeholder="Número da Mesa" value={manualTable} onChange={e => setManualTable(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500" />}
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle size={56} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Pedido Lançado!</h2>
                        <p className="text-gray-500 mt-2 px-6">O pedido já foi enviado para a produção na cozinha.</p>
                    </div>
                    
                    <div className="w-full space-y-3 pt-4">
                        <button 
                            onClick={() => { setCheckoutStep('cart'); setIsCartOpen(false); }} 
                            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                            <RotateCcw size={18} /> Novo pedido nesta mesa
                        </button>
                        <button 
                            onClick={onLogout} 
                            className={`w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}
                        >
                            <LayoutGrid size={18} /> {isWaitstaff ? 'Voltar para Mesas' : 'Finalizar e Sair'}
                        </button>
                    </div>
                </div>
              )}
            </div>

            {checkoutStep !== 'success' && (
              <div className="p-8 bg-gray-50 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Valor Total</span>
                  <span className="text-3xl font-brand font-bold">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    {checkoutStep === 'details' && <button onClick={() => setCheckoutStep('cart')} className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl"><ChevronLeft/></button>}
                    <button 
                      disabled={cart.length === 0 || isSending}
                      onClick={() => checkoutStep === 'cart' ? (isWaitstaff ? handleCheckout() : setCheckoutStep('details')) : handleCheckout()}
                      className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} disabled:opacity-50`}
                    >
                      {isSending ? <Loader2 className="animate-spin"/> : <>{checkoutStep === 'cart' && !isWaitstaff ? 'Próximo Passo' : <><Send size={18}/> {isWaitstaff ? 'Lançar Pedido' : 'Confirmar Pedido'}</>}</>}
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
