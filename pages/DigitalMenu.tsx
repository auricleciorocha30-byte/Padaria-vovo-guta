
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Star, Heart, Clock, Ticket, Check, MapPin, X, LogOut, MinusCircle, Info, ChevronLeft, Flame, Trash2, CheckCircle2 } from 'lucide-react';
import { Product, StoreSettings, Order, OrderItem, OrderType } from '../types';

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
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = useMemo(() => ['Todos', ...externalCategories], [externalCategories]);
  const filteredProducts = activeCategory === 'Todos' ? products : products.filter(p => p.category === activeCategory);
  
  const today = new Date().getDay();
  const featuredProduct = useMemo(() => products.find(p => p.featuredDay === today && p.isActive), [products, today]);

  // Find existing orders for this table (if in waitstaff mode)
  const tableOrders = useMemo(() => {
    if (!tableNumber) return [];
    return orders.filter(o => o.tableNumber === tableNumber && o.status !== 'ENTREGUE');
  }, [orders, tableNumber]);

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

  const checkout = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      type: tableNumber ? 'MESA' : 'BALCAO',
      tableNumber: tableNumber || undefined,
      items: cart,
      status: 'PREPARANDO',
      total: cartTotal,
      createdAt: Date.now(),
    };
    addOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    alert('Pedido enviado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#fff5e1] text-[#3d251e]">
      <header className="bg-[#3d251e] text-white p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={onLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1"
                title="Voltar / Trocar Mesa"
            >
                <ChevronLeft size={24} />
            </button>
            <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#f68c3e]" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-brand text-xl font-bold">{settings.storeName}</h1>
                {isWaitstaff && (
                    <span className="bg-orange-500 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-tighter">MODO GARÇONETE</span>
                )}
              </div>
              <p className="text-xs text-orange-300 flex items-center gap-1">
                <Clock size={12} /> {tableNumber ? `Mesa ${tableNumber}` : 'Balcão'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-[#f68c3e] rounded-full text-white hover:scale-105 transition-transform"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
        
        {/* Waitstaff Active Orders Summary */}
        {isWaitstaff && tableOrders.length > 0 && (
            <section className="bg-white rounded-[2rem] p-6 border-2 border-orange-100 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-orange-600">
                    <CheckCircle2 size={18} /> Pedidos Ativos nesta Mesa
                </h3>
                <div className="space-y-3">
                    {tableOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                            <div className="flex-1">
                                <p className="text-xs font-bold">#{order.id.slice(-4).toUpperCase()} - {order.status}</p>
                                <p className="text-[10px] text-gray-500">{order.items.length} itens - R$ {order.total.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-2">
                                {settings.canWaitstaffCancelItems && (
                                    <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {featuredProduct && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3d251e] to-[#5d3c33] text-white p-1 shadow-2xl">
            <div className="bg-[#3d251e]/80 p-8 rounded-[2.3rem] flex flex-col md:flex-row gap-8 items-center border border-white/5">
              <div className="relative w-full md:w-56 shrink-0 aspect-square group">
                <img src={featuredProduct.imageUrl} className="w-full h-full object-cover rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform duration-500" alt="Destaque" />
                <div className="absolute -top-3 -left-3 bg-[#f68c3e] p-3 rounded-2xl shadow-lg shadow-orange-500/30 transform -rotate-12 flex items-center gap-1">
                  <Flame size={20} className="text-white fill-white animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-tighter">Oferta do Dia</span>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-3xl font-brand font-bold text-[#f68c3e] leading-tight mb-2">{featuredProduct.name}</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{featuredProduct.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">Preço Especial</span>
                    <span className="text-4xl font-bold font-brand tracking-tight">R$ {featuredProduct.price.toFixed(2)}</span>
                  </div>
                  <button onClick={() => addToCart(featuredProduct)} className="w-full sm:w-auto bg-[#f68c3e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl active:scale-95">
                    Adicionar à Mesa
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="sticky top-[96px] z-10 py-4 bg-[#fff5e1]/80 backdrop-blur-sm -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl whitespace-nowrap font-bold transition-all ${
                  activeCategory === cat 
                  ? 'bg-[#3d251e] text-white shadow-xl scale-105' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-[#f68c3e] hover:text-[#3d251e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-5 hover:shadow-xl transition-all duration-300 group ${!product.isActive ? 'opacity-70 bg-gray-50' : ''}`}>
              <div className="relative shrink-0">
                <img src={product.imageUrl} className={`w-28 h-28 object-cover rounded-2xl group-hover:rotate-2 transition-transform ${!product.isActive ? 'grayscale' : ''}`} />
                {!product.isActive && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold tracking-tighter text-center px-1">INDISPONÍVEL</span>
                    </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className={`font-bold text-lg leading-tight mb-1 ${!product.isActive ? 'text-gray-400 line-through' : 'text-[#3d251e]'}`}>{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`font-bold text-xl ${!product.isActive ? 'text-gray-400' : 'text-[#f68c3e]'}`}>R$ {product.price.toFixed(2)}</span>
                  <button disabled={!product.isActive} onClick={() => addToCart(product)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${!product.isActive ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#3d251e] text-white hover:bg-black shadow-lg shadow-black/10'}`}>
                    {product.isActive ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isWaitstaff && (
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-orange-50/30 pointer-events-none">
                    <Star size={120} fill="currentColor" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-400 rounded-xl text-white shadow-lg">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <h2 className="font-bold text-xl text-[#3d251e]">Cartão Fidelidade</h2>
                    </div>
                    <div className="grid grid-cols-5 gap-3 mb-6">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center text-[10px] font-bold transition-all ${i <= 3 ? 'bg-orange-100 border-orange-500 text-orange-600 scale-105 shadow-inner' : 'border-gray-200 text-gray-300'}`}>
                        {i <= 3 ? <Check size={20} strokeWidth={3} /> : i}
                        </div>
                    ))}
                    </div>
                    <p className="text-sm text-gray-500 text-center font-medium bg-gray-50 py-3 rounded-2xl">Faltam <span className="text-orange-600 font-bold">7 selos</span> para ganhar seu brinde especial! 🎁</p>
                </div>
            </section>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden animate-slide-up shadow-2xl">
            <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-2xl flex items-center gap-3 text-[#3d251e]">
                <div className="p-2 bg-orange-100 rounded-xl text-[#f68c3e]">
                  <ShoppingCart size={24} />
                </div>
                Carrinho
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={28} />
              </button>
            </div>
            
            <div className="max-h-[50vh] overflow-auto p-8 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-4">
                  <ShoppingCart size={64} className="mx-auto opacity-10" />
                  <p className="font-medium">Carrinho vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-lg">x{item.quantity}</span>
                        <span className="text-xs text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <X size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-gray-400 text-sm font-medium">Subtotal</span>
                  <p className="text-3xl font-bold text-[#3d251e] tracking-tight">R$ {cartTotal.toFixed(2)}</p>
                </div>
              </div>
              <button disabled={cart.length === 0} onClick={checkout} className="w-full bg-[#3d251e] text-white py-5 rounded-3xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-95">
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-100 p-4 flex justify-around items-center sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
         <button className="flex flex-col items-center gap-1 group">
            <div className="p-2.5 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-400 group-hover:text-[#f68c3e] transition-all">
              <Ticket size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-[#3d251e]">Cupons</p>
         </button>
         
         {isWaitstaff && settings.canWaitstaffFinishOrder ? (
            <button className="flex flex-col items-center gap-1 group">
                <div className="p-4 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/20 -mt-8 border-4 border-white transition-all hover:scale-110">
                <CheckCircle2 size={32} />
                </div>
                <p className="text-[10px] font-bold text-green-600">Fechar Mesa</p>
            </button>
         ) : (
            <button className="flex flex-col items-center gap-1 group">
                <div className="p-2.5 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-400 group-hover:text-[#f68c3e] transition-all">
                <MapPin size={24} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 group-hover:text-[#3d251e]">Localizar</p>
            </button>
         )}

         <button onClick={onLogout} className="flex flex-col items-center gap-1 group">
            <div className="p-2.5 rounded-2xl bg-red-50 group-hover:bg-red-500 text-red-400 group-hover:text-white transition-all shadow-sm">
              <LogOut size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-red-500">Sair</p>
         </button>
      </footer>
    </div>
  );
};

export default DigitalMenu;

function PlusCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="16" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  );
}
