
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Clock, X, ChevronLeft, Trash2, CheckCircle2, Plus as PlusIcon, MapPin, CreditCard, Banknote, QrCode, Utensils, ShoppingBag, Truck, MessageSquare } from 'lucide-react';
import { Product, StoreSettings, Order, OrderItem, OrderType, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  products: Product[];
  categories: string[];
  settings: StoreSettings;
  orders: Order[];
  addOrder: (order: Order) => void;
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
  const today = new Date().getDay();
  const featuredProduct = useMemo(() => products.find(p => p.featuredDay === today && p.isActive), [products, today]);

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
        alert('Pedido enviado com sucesso!');
    } catch (err) {
        alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5e1] text-[#3d251e]">
      <header className={`sticky top-0 z-20 shadow-lg transition-colors ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'} text-white p-6`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1">
                <ChevronLeft size={24} />
            </button>
            <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border-2 border-white/20" />
            <div>
              <h1 className="font-brand text-xl font-bold">{settings.storeName}</h1>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <Clock size={12} /> {tableNumber ? `Mesa ${tableNumber}` : 'Atendimento Digital'}
              </p>
            </div>
          </div>
          <button onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }} className="relative p-2 bg-white/10 rounded-full hover:scale-105 transition-transform">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-12">
        {/* Oferta do Dia */}
        {featuredProduct && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3d251e] to-[#5d3c33] text-white p-1 shadow-2xl">
            <div className="bg-[#3d251e]/80 p-8 rounded-[2.3rem] flex flex-col md:flex-row gap-8 items-center border border-white/5">
              <div className="relative w-full md:w-48 shrink-0 aspect-square">
                <img src={featuredProduct.imageUrl} className="w-full h-full object-cover rounded-[2rem] shadow-2xl" alt="Destaque" />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-brand font-bold text-[#f68c3e] leading-tight">{featuredProduct.name}</h2>
                <p className="text-gray-300 text-sm">{featuredProduct.description}</p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/10">
                  <span className="text-4xl font-bold font-brand tracking-tight text-white">R$ {featuredProduct.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(featuredProduct)} className="w-full sm:w-auto bg-[#f68c3e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl active:scale-95">
                    Adicionar Agora
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categorias */}
        <div className="sticky top-[96px] z-10 py-4 bg-[#fff5e1]/80 backdrop-blur-sm -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-2xl whitespace-nowrap font-bold transition-all ${activeCategory === cat ? 'bg-[#3d251e] text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-5 hover:shadow-xl transition-all duration-300 group">
              <img src={product.imageUrl} className="w-28 h-28 object-cover rounded-2xl group-hover:rotate-2 transition-transform" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#3d251e]">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-xl text-[#f68c3e]">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className="w-10 h-10 rounded-2xl bg-[#3d251e] text-white flex items-center justify-center hover:scale-105 shadow-lg">
                    <PlusIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Checkout Moderno */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-2xl flex items-center gap-3">
                {checkoutStep === 'cart' ? 'Seu Carrinho' : checkoutStep === 'details' ? 'Onde Entregar?' : 'Pagamento'}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6 custom-scrollbar">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-400"><ShoppingCart size={64} className="mx-auto opacity-10 mb-4" /><p>Carrinho Vazio</p></div>
                  ) : (
                    cart.map(item => (
                      <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1"><h4 className="font-bold">{item.name}</h4><p className="text-xs text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                        <button onClick={() => removeFromCart(item.productId)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setOrderType('MESA')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'MESA' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><Utensils size={20} /><span className="text-[10px] font-bold">MESA</span></button>
                    <button onClick={() => setOrderType('BALCAO')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'BALCAO' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><ShoppingBag size={20} /><span className="text-[10px] font-bold">BALCÃO</span></button>
                    <button onClick={() => setOrderType('ENTREGA')} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'ENTREGA' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><Truck size={20} /><span className="text-[10px] font-bold">ENTREGA</span></button>
                  </div>

                  {orderType === 'MESA' && (
                    <div className="animate-fade-in"><label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Número da Mesa</label><input type="text" value={manualTable} onChange={(e) => setManualTable(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500" placeholder="Digite o número da mesa" /></div>
                  )}

                  {orderType === 'ENTREGA' && (
                    <div className="animate-fade-in"><label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Endereço Completo</label><textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500 min-h-[100px]" placeholder="Rua, Número, Bairro, Complemento..." /></div>
                  )}
                  
                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Observações do Pedido</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500" placeholder="Sem cebola, bem passado..." /></div>
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setPayment('PIX')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${payment === 'PIX' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><QrCode size={24} /><div className="text-left"><p className="font-bold">PIX</p><p className="text-[10px] opacity-70">Pagamento Instantâneo</p></div></button>
                    <button onClick={() => setPayment('CARTAO')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${payment === 'CARTAO' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><CreditCard size={24} /><div className="text-left"><p className="font-bold">Cartão</p><p className="text-[10px] opacity-70">Débito ou Crédito na Entrega/Mesa</p></div></button>
                    <button onClick={() => setPayment('DINHEIRO')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${payment === 'DINHEIRO' ? 'border-[#f68c3e] bg-orange-50 text-orange-600' : 'border-gray-100'}`}><Banknote size={24} /><div className="text-left"><p className="font-bold">Dinheiro</p><p className="text-[10px] opacity-70">Pagamento em Espécie</p></div></button>
                  </div>

                  {payment === 'DINHEIRO' && (
                    <div className="animate-fade-in"><label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-1 block">Troco para quanto?</label><input type="number" value={changeFor} onChange={(e) => setChangeFor(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500" placeholder="Ex: 50.00" /></div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div><span className="text-gray-400 text-sm">Total</span><p className="text-3xl font-bold text-[#3d251e]">R$ {cartTotal.toFixed(2)}</p></div>
              </div>
              
              <div className="flex gap-4">
                {checkoutStep !== 'cart' && (
                  <button onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')} className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all"><ChevronLeft /></button>
                )}
                <button 
                  disabled={cart.length === 0 || isSending}
                  onClick={() => {
                    if (checkoutStep === 'cart') setCheckoutStep('details');
                    else if (checkoutStep === 'details') setCheckoutStep('payment');
                    else handleCheckout();
                  }}
                  className={`flex-1 py-5 rounded-3xl font-bold text-lg text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${isWaitstaff ? 'bg-[#f68c3e]' : 'bg-[#3d251e]'}`}
                >
                  {isSending ? 'Enviando...' : checkoutStep === 'payment' ? 'Finalizar Pedido' : 'Continuar'}
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
