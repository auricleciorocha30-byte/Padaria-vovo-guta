
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Clock, X, ChevronLeft, Trash2, Plus as PlusIcon, MapPin, CreditCard, Banknote, QrCode, Utensils, ShoppingBag, Truck, MessageSquare, Loader2 } from 'lucide-react';
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
  
  // Checkout States
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
    if (orderType === 'ENTREGA' && !address) { alert('Informe o endereço de entrega'); return; }
    
    setIsSending(true);
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      type: orderType,
      tableNumber: orderType === 'MESA' ? manualTable : undefined,
      items: cart,
      status: 'PREPARANDO',
      total: cartTotal,
      createdAt: Date.now(),
      paymentMethod: payment,
      deliveryAddress: orderType === 'ENTREGA' ? address : undefined,
      notes,
      changeFor: payment === 'DINHEIRO' && changeFor ? parseFloat(changeFor) : undefined
    };

    try {
        await addOrder(newOrder);
        setCart([]);
        setIsCartOpen(false);
        setCheckoutStep('cart');
        alert('Pedido enviado com sucesso! Aguarde o preparo.');
    } catch (err) {
        alert('Erro ao enviar pedido. Verifique sua internet.');
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
            <img src={settings.logoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" alt="Logo" />
            <h1 className="font-brand text-lg font-bold">{settings.storeName}</h1>
          </div>
          <button onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }} className="relative p-2 bg-white/10 rounded-full">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-12">
        {/* Filtro de Categorias */}
        <div className="sticky top-[96px] z-10 py-4 bg-[#fff5e1]/80 backdrop-blur-sm -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${activeCategory === cat ? 'bg-[#3d251e] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {cat}
              </button>
            ))}
        </div>

        {/* Listagem de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
              <img src={product.imageUrl} className="w-24 h-24 object-cover rounded-2xl" alt={product.name} />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-600">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-xl bg-[#3d251e] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                    <PlusIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Finalização (Checkout) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-slide-up">
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="font-bold text-xl">{checkoutStep === 'cart' ? 'Carrinho' : checkoutStep === 'details' ? 'Onde você está?' : 'Como quer pagar?'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {checkoutStep === 'cart' && (
                <div className="space-y-3">
                  {cart.length === 0 ? <p className="text-center text-gray-400 py-10">Carrinho Vazio</p> : cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                        {id: 'MESA', label: 'Na Mesa', icon: <Utensils size={20}/>},
                        {id: 'BALCAO', label: 'Retirada', icon: <ShoppingBag size={20}/>},
                        {id: 'ENTREGA', label: 'Entrega', icon: <Truck size={20}/>}
                    ].map(t => (
                        <button key={t.id} onClick={() => setOrderType(t.id as any)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === t.id ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-400'}`}>
                            {t.icon} <span className="text-[10px] font-bold">{t.label}</span>
                        </button>
                    ))}
                  </div>
                  {orderType === 'MESA' && <input type="text" placeholder="Número da Mesa" value={manualTable} onChange={e => setManualTable(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-orange-500" />}
                  {orderType === 'ENTREGA' && <textarea placeholder="Endereço Completo" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-orange-500 min-h-[80px]" />}
                  <textarea placeholder="Observações (opcional)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-orange-500 min-h-[60px]" />
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-4">
                  {[
                      {id: 'PIX', label: 'Pix Instantâneo', icon: <QrCode size={20}/>},
                      {id: 'CARTAO', label: 'Cartão (Mesa/Entrega)', icon: <CreditCard size={20}/>},
                      {id: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={20}/>}
                  ].map(p => (
                      <button key={p.id} onClick={() => setPayment(p.id as any)} className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${payment === p.id ? 'border-[#f68c3e] bg-orange-50 text-[#f68c3e]' : 'border-gray-50 text-gray-500'}`}>
                          {p.icon} <span className="font-bold">{p.label}</span>
                      </button>
                  ))}
                  {payment === 'DINHEIRO' && <input type="number" placeholder="Troco para quanto?" value={changeFor} onChange={e => setChangeFor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" />}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Subtotal</span>
                <span className="text-3xl font-brand font-bold">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                  {checkoutStep !== 'cart' && <button onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')} className="px-6 py-4 bg-white border rounded-2xl"><ChevronLeft/></button>}
                  <button 
                    disabled={cart.length === 0 || isSending}
                    onClick={() => {
                        if (checkoutStep === 'cart') setCheckoutStep('details');
                        else if (checkoutStep === 'details') setCheckoutStep('payment');
                        else handleCheckout();
                    }}
                    className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}
                  >
                    {isSending ? <Loader2 className="animate-spin"/> : checkoutStep === 'payment' ? 'Enviar Pedido' : 'Próximo'}
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
