
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Product, OrderType, OrderItem, StoreSettings } from '../types';
import { Clock, CheckCircle, ChefHat, XCircle, ShoppingBag, MapPin, Coffee, Plus, Hash, ShoppingCart, User, X, Search, Printer } from 'lucide-react';

interface Props {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  products: Product[];
  addOrder: (order: Order) => void;
  settings: StoreSettings;
}

const OrdersList: React.FC<Props> = ({ orders, updateStatus, products, addOrder, settings }) => {
  const [showManualOrder, setShowManualOrder] = useState<{type: OrderType, table?: string} | null>(null);
  const [manualCart, setManualCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const tables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  const occupiedTables = useMemo(() => {
    return new Set(orders.filter(o => o.status !== 'ENTREGUE' && o.tableNumber).map(o => o.tableNumber));
  }, [orders]);

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => {
        window.print();
        setPrintOrder(null);
    }, 100);
  };

  const handleManualCheckout = () => {
    if (manualCart.length === 0 || !showManualOrder) return;
    const total = manualCart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      type: showManualOrder.type,
      tableNumber: showManualOrder.table,
      items: manualCart,
      status: 'PREPARANDO',
      total: total,
      createdAt: Date.now(),
    };
    addOrder(newOrder);
    setManualCart([]);
    setShowManualOrder(null);
  };

  const addToManualCart = (p: Product) => {
    setManualCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) return prev.map(i => i.productId === p.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { productId: p.id, name: p.name, price: p.price, quantity: 1 }];
    });
  };

  const removeFromManualCart = (id: string) => {
    setManualCart(prev => prev.filter(i => i.productId !== id));
  };

  const filteredProducts = products.filter(p => p.isActive && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <style>{`
        @media print {
            @page { margin: 0; size: auto; }
            body * { visibility: hidden; }
            #thermal-receipt, #thermal-receipt * { visibility: visible; }
            #thermal-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: ${settings.thermalPrinterWidth || '80mm'};
                font-family: 'Courier New', Courier, monospace;
                color: #000;
                padding: 5mm;
                background: #fff;
                font-size: 10pt;
                line-height: 1.2;
            }
            .no-print { display: none !important; }
            .print-bold { font-weight: 900; }
            .print-divider { border-top: 2px solid #000; margin: 3mm 0; }
            .print-large { font-size: 14pt; }
            .print-xl { font-size: 20pt; }
        }
      `}</style>

      {/* Table Management Section */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#3d251e]">
            <Hash size={20} className="text-[#f68c3e]" /> Status das Mesas
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
            {tables.map(table => (
                <button 
                    key={table}
                    onClick={() => setShowManualOrder({type: 'MESA', table})}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all ${
                        occupiedTables.has(table) 
                        ? 'bg-orange-50 border-orange-200 text-orange-600 font-bold' 
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-orange-300'
                    }`}
                >
                    <span className="text-[10px] uppercase opacity-50">Mesa</span>
                    <span className="text-lg">{table}</span>
                </button>
            ))}
        </div>
      </section>

      {/* Manual Actions */}
      <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowManualOrder({type: 'ENTREGA'})}
            className="flex-1 min-w-[200px] py-4 bg-[#3d251e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/10"
          >
              <MapPin size={20} /> Nova Entrega
          </button>
          <button 
            onClick={() => setShowManualOrder({type: 'BALCAO'})}
            className="flex-1 min-w-[200px] py-4 bg-[#f68c3e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10"
          >
              <ShoppingBag size={20} /> Nova Retirada Balcão
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block w-fit mb-1 ${
                      order.type === 'MESA' ? 'bg-blue-50 text-blue-600' : 
                      order.type === 'ENTREGA' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                  }`}>
                      {order.type} {order.tableNumber && `(Mesa ${order.tableNumber})`}
                  </span>
                  <span className="text-[10px] font-mono text-gray-300">#{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                  <button 
                      onClick={() => handlePrint(order)}
                      className="mt-2 p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#3d251e] hover:bg-gray-100 transition-colors"
                      title="Imprimir Cupom Térmico"
                  >
                      <Printer size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium"><strong>{item.quantity}x</strong> {item.name}</span>
                    <span className="font-bold text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-brand font-bold text-[#3d251e]">R$ {order.total.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'PREPARANDO' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'PRONTO')}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    <CheckCircle size={14} /> Pronto
                  </button>
                )}
                {order.status === 'PRONTO' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ENTREGUE')}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    <ShoppingBag size={14} /> Entregar
                  </button>
                )}
                <button 
                  onClick={() => updateStatus(order.id, 'CANCELADO')}
                  className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Order Modal (OMITTED FOR BREVITY - KEEPING ORIGINAL LOGIC) */}
      {showManualOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] animate-scale-up">
                  <div className="flex-1 p-8 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#3d251e] flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><Plus size={24} /></div>
                            {showManualOrder.type === 'MESA' ? `Pedido Mesa ${showManualOrder.table}` : `Novo Pedido ${showManualOrder.type}`}
                        </h2>
                        <button onClick={() => setShowManualOrder(null)} className="md:hidden text-gray-400"><X /></button>
                      </div>
                      <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Pesquisar item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all"/>
                      </div>
                      <div className="flex-1 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-2 custom-scrollbar">
                          {filteredProducts.map(p => (
                              <button key={p.id} onClick={() => addToManualCart(p)} className="p-4 bg-white border border-gray-100 rounded-3xl flex gap-4 hover:border-orange-500 hover:shadow-lg transition-all text-left group">
                                  <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                  <div className="flex-1 overflow-hidden">
                                      <p className="font-bold text-gray-800 truncate">{p.name}</p>
                                      <p className="text-xs text-orange-600 font-bold">R$ {p.price.toFixed(2)}</p>
                                  </div>
                                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center text-gray-400 transition-all"><Plus size={18} /></div>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="w-full md:w-80 bg-gray-50 border-l border-gray-100 p-8 flex flex-col overflow-hidden">
                      <h3 className="font-bold text-lg mb-8">Resumo do Pedido</h3>
                      <div className="flex-1 overflow-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                          {manualCart.map(item => (
                              <div key={item.productId} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
                                  <div className="flex-1 pr-2 overflow-hidden"><p className="text-xs font-bold text-gray-800 truncate">{item.name}</p><p className="text-[10px] text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)}</p></div>
                                  <button onClick={() => removeFromManualCart(item.productId)} className="text-gray-300 hover:text-red-500 p-2 transition-all"><X size={16} /></button>
                              </div>
                          ))}
                      </div>
                      <div className="space-y-4 pt-6 border-t border-gray-200">
                          <div className="flex justify-between items-center"><span className="text-gray-400 text-xs font-bold uppercase">Total</span><span className="text-2xl font-bold text-[#3d251e]">R$ {manualCart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span></div>
                          <button disabled={manualCart.length === 0} onClick={handleManualCheckout} className="w-full py-5 bg-[#3d251e] text-white rounded-[1.5rem] font-bold text-lg hover:bg-black transition-all disabled:opacity-30">Criar Pedido</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Hidden Thermal Print Template - High Contrast Black */}
      {printOrder && (
          <div id="thermal-receipt">
              <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
                  <h1 className="print-bold print-large" style={{ margin: '0 0 2mm 0', textTransform: 'uppercase' }}>{settings.storeName}</h1>
                  <p className="print-bold" style={{ margin: 0, border: '2px solid #000', display: 'inline-block', padding: '1mm 3mm' }}>CUPOM NÃO FISCAL</p>
                  <p style={{ margin: '2mm 0 0 0' }}>{new Date(printOrder.createdAt).toLocaleString('pt-BR')}</p>
              </div>

              <div className="print-divider"></div>

              <div style={{ padding: '2mm 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2mm' }}>
                      <span className="print-bold print-large">{printOrder.type}</span>
                      <span className="print-bold">#{printOrder.id.slice(-6).toUpperCase()}</span>
                  </div>
                  {printOrder.tableNumber && (
                    <div style={{ background: '#000', color: '#fff', padding: '3mm', textAlign: 'center', margin: '2mm 0' }}>
                        <h2 className="print-bold print-xl" style={{ margin: 0 }}>MESA {printOrder.tableNumber}</h2>
                    </div>
                  )}
              </div>

              <div className="print-divider"></div>

              <div style={{ padding: '2mm 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '1mm', marginBottom: '2mm' }}>
                      <span className="print-bold">ITEM/QTD</span>
                      <span className="print-bold">PREÇO</span>
                  </div>
                  {printOrder.items.map((item, i) => (
                      <div key={i} style={{ marginBottom: '3mm' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="print-bold" style={{ flex: 1 }}>{item.quantity}x {item.name.toUpperCase()}</span>
                              <span className="print-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="print-divider" style={{ borderTopWidth: '4px' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '2mm' }}>
                  <span className="print-bold print-large">TOTAL</span>
                  <span className="print-bold print-xl">R$ {printOrder.total.toFixed(2)}</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '15mm', borderTop: '1px dashed #000', paddingTop: '5mm' }}>
                  <p className="print-bold" style={{ margin: '0 0 2mm 0' }}>VOVÓ GUTA PADARIA</p>
                  <p style={{ fontSize: '8pt', margin: 0 }}>SISTEMA DE GESTÃO GASTRONÔMICA</p>
                  <div style={{ marginTop: '10mm' }}>. . . . . . . . . . . . . . . . . . . . . .</div>
              </div>
          </div>
      )}
    </div>
  );
};

export default OrdersList;
