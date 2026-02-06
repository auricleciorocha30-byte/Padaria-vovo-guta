
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Clock, X, ChevronLeft, Trash2, Plus as PlusIcon, MapPin, CreditCard, Banknote, QrCode, Utensils, ShoppingBag, Truck, MessageSquare, Loader2, Send, Search } from 'lucide-react';
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
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? 'MESA' : 'BALCAO');
  const [manualTable, setManualTable] = useState(tableNumber || '');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [isSending, setIsSending] = useState(false);

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
    if (!product.isActive) return;
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
    if (orderType === 'MESA' && !manualTable) { alert('Informe o número da mesa'); return; }
    
    setIsSending(true);
    
    const newOrder: any = {
      id: Math.random().toString(36).substr(2, 9),
      type: isWaitstaff ? 'MESA' : orderType,
      items: cart,
      status: 'PREPARANDO',
      total: cartTotal,
      createdAt: Date.now(),
      paymentMethod: payment,
      notes: notes.trim() || undefined,
      tableNumber: (tableNumber || manualTable) || undefined,
      deliveryAddress: orderType === 'ENTREGA' ? address : undefined,
      changeFor: (payment === 'DINHEIRO' && changeFor) ? parseFloat(changeFor) : undefined
    };

    try {
        await addOrder(newOrder);
        setCart([]);
        setIsCartOpen(false);
        setCheckoutStep('cart');
        alert('✅ Pedido enviado com sucesso!');
        if (isWaitstaff) onLogout();
    } catch (err: any) {
        console.error("Erro fatal no envio:", err);
        // Agora mostra o erro real para o usuário
        alert(`❌ Erro no envio: ${err.message || "Verifique a conexão"}\n\nO sistema tentou enviar os dados básicos, mas o banco ainda rejeitou. Informe ao suporte.`);
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5e1] text-[#3d251e]">
      <header className={`sticky top-0 z-20 shadow-lg ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} text-white p-6`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
            <div className="flex flex-col">
                <h1 className="font-brand text-lg font-bold leading-none">{isWaitstaff ? 'Atendimento Garçom' : settings.storeName}</h1>
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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Lupa de Busca em destaque */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="O que você deseja buscar?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none shadow-sm font-medium transition-all"
          />
          {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500">
                <X size={20} />
              </button>
          )}
        </div>

        {/* Categorias em scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setSearchTerm(''); }} 
                className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm transition-all shadow-sm border ${activeCategory === cat ? 'bg-[#3d251e] text-white border-[#3d251e]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
              >
                {cat}
              </button>
            ))}
        </div>

        {/* Listagem com animação suave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
          {filteredProducts.length > 0 ? filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm flex gap-4 items-center border border-gray-50 hover:border-orange-100 transition-colors group">
              <div className="relative overflow-hidden rounded-2xl shrink-0">
                <img src={product.imageUrl} className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800">{product.name}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-600">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}>
                    <PlusIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 text-gray-300">
                <Search size={64} className="opacity-10" />
                <p className="font-bold uppercase tracking-widest text-xs">Produto não encontrado</p>
                <button onClick={() => { setSearchTerm(''); setActiveCategory('Todos'); }} className="text-orange-500 font-bold text-xs">LIMPAR BUSCA</button>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slide-up">
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="font-bold text-xl">{checkoutStep === 'cart' ? 'Sacola' : 'Finalizar'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <textarea placeholder="Alguma observação para o pedido?" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 transition-colors" />
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-6">
                  {!isWaitstaff && (
                    <div className="grid grid-cols-3 gap-2">
                        {['MESA', 'BALCAO', 'ENTREGA'].map(t => (
                            <button key={t} onClick={() => setOrderType(t as any)} className={`p-4 rounded-2xl border-2 text-[10px] font-bold transition-all ${orderType === t ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-400'}`}>
                                {t === 'MESA' ? <Utensils size={18} className="mx-auto mb-1"/> : t === 'BALCAO' ? <ShoppingBag size={18} className="mx-auto mb-1"/> : <Truck size={18} className="mx-auto mb-1"/>}
                                {t}
                            </button>
                        ))}
                    </div>
                  )}
                  {orderType === 'MESA' && !tableNumber && <input type="text" placeholder="Número da Mesa" value={manualTable} onChange={e => setManualTable(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 transition-colors" />}
                  {orderType === 'ENTREGA' && <textarea placeholder="Endereço Completo" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 transition-colors" />}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total do Pedido</span>
                <span className="text-3xl font-brand font-bold">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                  {checkoutStep !== 'cart' && <button onClick={() => setCheckoutStep('cart')} className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-100 transition-colors"><ChevronLeft/></button>}
                  <button 
                    disabled={cart.length === 0 || isSending}
                    onClick={() => checkoutStep === 'cart' ? (isWaitstaff ? handleCheckout() : setCheckoutStep('details')) : handleCheckout()}
                    className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isWaitstaff ? 'bg-[#f68c3e] hover:bg-orange-600' : 'bg-[#3d251e] hover:bg-black'} disabled:opacity-50 disabled:active:scale-100`}
                  >
                    {isSending ? <Loader2 className="animate-spin"/> : <><Send size={18}/> {isWaitstaff ? 'Lançar Mesa' : 'Enviar Pedido'}</>}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DigitalMenu;
