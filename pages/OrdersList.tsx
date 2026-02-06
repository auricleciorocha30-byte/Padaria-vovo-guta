
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Product, OrderType, OrderItem, StoreSettings } from '../types';
import { Clock, CheckCircle, XCircle, ShoppingBag, MapPin, Plus, Hash, Search, Printer, CreditCard, Banknote, QrCode, MessageSquare, AlertTriangle } from 'lucide-react';

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
  const occupiedTables = useMemo(() => new Set(orders.filter(o => o.status !== 'ENTREGUE' && o.tableNumber).map(o => o.tableNumber)), [orders]);

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => { window.print(); setPrintOrder(null); }, 100);
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
      paymentMethod: 'DINHEIRO'
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
            #thermal-receipt { position: absolute; left: 0; top: 0; width: ${settings.thermalPrinterWidth || '80mm'}; padding: 5mm; background: #fff; font-family: monospace; font-size: 10pt; line-height: 1.2; }
            .no-print { display: none !important; }
        }
      `}</style>

      {/* Mesas */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#3d251e]"><Hash size={20} className="text-[#f68c3e]" /> Status das Mesas</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
            {tables.map(table => (
                <button key={table} onClick={() => setShowManualOrder({type: 'MESA', table})} className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all ${occupiedTables.has(table) ? 'bg-orange-50 border-orange-200 text-orange-600 font-bold' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-orange-300'}`}>
                    <span className="text-[10px] uppercase opacity-50">Mesa</span>
                    <span className="text-lg">{table}</span>
                </button>
            ))}
        </div>
      </section>

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-4">
          <button onClick={() => setShowManualOrder({type: 'ENTREGA'})} className="flex-1 min-w-[200px] py-4 bg-[#3d251e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg"><MapPin size={20} /> Nova Entrega</button>
          <button onClick={() => setShowManualOrder({type: 'BALCAO'})} className="flex-1 min-w-[200px] py-4 bg-[#f68c3e] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg"><ShoppingBag size={20} /> Novo Balcão</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden ${order.status === 'PREPARANDO' ? 'border-l-4 border-l-orange-500' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block w-fit mb-1 ${
                      order.type === 'MESA' ? 'bg-blue-50 text-blue-600' : 
                      order.type === 'ENTREGA' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                  }`}>
                      {order.type} {order.tableNumber && `(Mesa ${order.tableNumber})`}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {order.paymentMethod === 'PIX' && <QrCode size={14} className="text-blue-500" />}
                    {order.paymentMethod === 'CARTAO' && <CreditCard size={14} className="text-green-500" />}
                    {order.paymentMethod === 'DINHEIRO' && <Banknote size={14} className="text-orange-500" />}
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{order.paymentMethod || 'NÃO INF.'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <button onClick={() => handlePrint(order)} className="mt-2 p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-black"><Printer size={16} /></button>
                </div>
              </div>

              {order.type === 'ENTREGA' && order.deliveryAddress && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl flex items-start gap-2 border border-purple-100">
                    <MapPin size={14} className="text-purple-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-purple-800 leading-tight font-medium uppercase">{order.deliveryAddress}</p>
                </div>
              )}

              <div className="space-y-2 mb-6 max-h-48 overflow-auto custom-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium"><strong>{item.quantity}x</strong> {item.name}</span>
                    <span className="font-bold text-gray-300 text-xs">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-start gap-2 border border-gray-200">
                  <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                  <p className="text-[10px] italic text-gray-600 leading-tight">"{order.notes}"</p>
                </div>
              )}

              {order.changeFor && (
                <div className="mb-4 p-2 bg-orange-50 rounded-lg flex items-center gap-2 border border-orange-100">
                    <AlertTriangle size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-700">TROCO PARA R$ {order.changeFor.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-brand font-bold text-[#3d251e]">R$ {order.total.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'PREPARANDO' && (
                  <button onClick={() => updateStatus(order.id, 'PRONTO')} className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center justify-center gap-2 shadow-lg"><CheckCircle size={14} /> Pronto</button>
                )}
                {order.status === 'PRONTO' && (
                  <button onClick={() => updateStatus(order.id, 'ENTREGUE')} className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg"><ShoppingBag size={14} /> Entregar</button>
                )}
                <button onClick={() => updateStatus(order.id, 'CANCELADO')} className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors"><XCircle size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cupom Térmico */}
      {printOrder && (
          <div id="thermal-receipt">
              <div style={{ textAlign: 'center', marginBottom: '5mm' }}>
                  <h1 style={{ fontSize: '14pt', margin: 0 }}>{settings.storeName}</h1>
                  <p style={{ margin: '1mm 0' }}>{new Date(printOrder.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div style={{ borderTop: '1px solid #000', padding: '2mm 0' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>#{printOrder.id.slice(-6).toUpperCase()} - {printOrder.type}</p>
                  {printOrder.tableNumber && <p style={{ fontSize: '18pt', margin: '2mm 0', textAlign: 'center' }}>MESA {printOrder.tableNumber}</p>}
                  {printOrder.deliveryAddress && <p style={{ fontSize: '8pt' }}>ENTREGA: {printOrder.deliveryAddress}</p>}
              </div>
              <div style={{ borderTop: '1px solid #000', padding: '2mm 0' }}>
                  {printOrder.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                          <span>{item.quantity}x {item.name.slice(0, 20)}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                  ))}
              </div>
              <div style={{ borderTop: '2px solid #000', paddingTop: '2mm', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>TOTAL:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14pt' }}>R$ {printOrder.total.toFixed(2)}</span>
              </div>
              <p style={{ textAlign: 'center', marginTop: '5mm', fontSize: '8pt' }}>PGTO: {printOrder.paymentMethod}</p>
          </div>
      )}
    </div>
  );
};

export default OrdersList;
