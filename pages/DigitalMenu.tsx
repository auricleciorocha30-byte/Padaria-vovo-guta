
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Clock, X, ChevronLeft, Trash2, Plus as PlusIcon, MapPin, CreditCard, Banknote, QrCode, Utensils, ShoppingBag, Truck, MessageSquare, Loader2, Send } from 'lucide-react';
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
  
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? 'MESA' : 'BALCAO');
  const [manualTable, setManualTable] = useState(tableNumber || '');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [isSending, setIsSending] = useState(false);

  const categories = useMemo(() => ['Todos', ...externalCategories], [externalCategories]);
  const filteredProducts = activeCategory === 'Todos' ? products : products.filter(p => p.category === activeCategory);
  
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
    
    // Objeto de pedido completo
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
        console.error("Erro no envio:", err);
        alert(`❌ Erro: ${err.message || "Falha ao conectar com o servidor"}.\n\nDica: Se o erro persistir, peça para o administrador verificar se as colunas 'paymentMethod' e 'type' existem na tabela 'orders' do Supabase.`);
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${activeCategory === cat ? 'bg-[#3d251e] text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {cat}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm flex gap-4 items-center">
              <img src={product.imageUrl} className="w-20 h-20 object-cover rounded-2xl" alt={product.name} />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{product.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-600">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className={`w-8 h-8 rounded-xl text-white flex items-center justify-center ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}>
                    <PlusIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="font-bold text-xl">{checkoutStep === 'cart' ? 'Itens' : 'Finalizar'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-300"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <textarea placeholder="Alguma observação?" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" />
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-6">
                  {!isWaitstaff && (
                    <div className="grid grid-cols-3 gap-2">
                        {['MESA', 'BALCAO', 'ENTREGA'].map(t => (
                            <button key={t} onClick={() => setOrderType(t as any)} className={`p-4 rounded-2xl border-2 text-[10px] font-bold ${orderType === t ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50'}`}>
                                {t === 'MESA' ? <Utensils size={18} className="mx-auto mb-1"/> : t === 'BALCAO' ? <ShoppingBag size={18} className="mx-auto mb-1"/> : <Truck size={18} className="mx-auto mb-1"/>}
                                {t}
                            </button>
                        ))}
                    </div>
                  )}
                  {orderType === 'MESA' && !tableNumber && <input type="text" placeholder="Número da Mesa" value={manualTable} onChange={e => setManualTable(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" />}
                  {orderType === 'ENTREGA' && <textarea placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" />}
                  
                  {!isWaitstaff && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase">Pagamento</p>
                        {['PIX', 'CARTAO', 'DINHEIRO'].map(p => (
                            <button key={p} onClick={() => setPayment(p as any)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${payment === p ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50'}`}>
                                {p === 'PIX' ? <QrCode size={18}/> : p === 'CARTAO' ? <CreditCard size={18}/> : <Banknote size={18}/>}
                                <span className="font-bold text-sm">{p}</span>
                            </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-xs font-bold uppercase">Total</span>
                <span className="text-3xl font-brand font-bold">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                  {checkoutStep !== 'cart' && <button onClick={() => setCheckoutStep('cart')} className="px-6 py-4 bg-white border rounded-2xl"><ChevronLeft/></button>}
                  <button 
                    disabled={cart.length === 0 || isSending}
                    onClick={() => checkoutStep === 'cart' ? setCheckoutStep('details') : handleCheckout()}
                    className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} disabled:opacity-50`}
                  >
                    {isSending ? <Loader2 className="animate-spin"/> : checkoutStep === 'cart' ? 'Próximo' : <><Send size={18}/> Enviar</>}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalMenu;
