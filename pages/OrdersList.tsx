
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Product, OrderType, OrderItem, StoreSettings } from '../types';
import { Clock, CheckCircle, XCircle, ShoppingBag, MapPin, Printer, CreditCard, Banknote, QrCode, MessageSquare, AlertTriangle, Hash, Truck, Utensils } from 'lucide-react';

interface Props {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  products: Product[];
  addOrder: (order: Order) => void;
  settings: StoreSettings;
}

const OrdersList: React.FC<Props> = ({ orders, updateStatus, products, addOrder, settings }) => {
  const [filterType, setFilterType] = useState<'TODOS' | OrderType>('TODOS');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Somente mostrar pedidos ativos (que não foram entregues ou cancelados)
  const activeOrders = useMemo(() => {
    return orders.filter(o => 
      o.status !== 'ENTREGUE' && 
      o.status !== 'CANCELADO' && 
      (filterType === 'TODOS' || o.type === filterType)
    );
  }, [orders, filterType]);

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => { window.print(); setPrintOrder(null); }, 200);
  };

  const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
    try {
        await updateStatus(id, newStatus);
    } catch (err) {
        alert("Erro ao atualizar status. Verifique sua conexão.");
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
            body * { visibility: hidden; }
            #thermal-receipt, #thermal-receipt * { visibility: visible; }
            #thermal-receipt { position: absolute; left: 0; top: 0; width: ${settings.thermalPrinterWidth || '80mm'}; padding: 4mm; background: #fff; font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.2; }
        }
      `}</style>

      {/* Filtros de Tipo de Pedido */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'TODOS', label: 'Todos', icon: <Hash size={14}/> },
            { id: 'MESA', label: 'Mesas', icon: <Utensils size={14}/> },
            { id: 'BALCAO', label: 'Balcão', icon: <ShoppingBag size={14}/> },
            { id: 'ENTREGA', label: 'Delivery', icon: <Truck size={14}/> }
          ].map(f => (
            <button 
                key={f.id} 
                onClick={() => setFilterType(f.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${filterType === f.id ? 'bg-[#3d251e] text-white border-[#3d251e]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
            >
                {f.icon} {f.label}
            </button>
          ))}
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">Nenhum pedido ativo no momento</h3>
            <p className="text-sm text-gray-300">Os novos pedidos aparecerão aqui instantaneamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all animate-scale-up relative group">
              
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      order.type === 'MESA' ? 'bg-blue-50 text-blue-600' : 
                      order.type === 'ENTREGA' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                  }`}>
                      {order.type} {order.tableNumber && `(Mesa ${order.tableNumber})`}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handlePrint(order)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-black hover:bg-gray-100 transition-colors">
                        <Printer size={18} />
                    </button>
                    <button onClick={() => handleStatusUpdate(order.id, 'CANCELADO')} className="p-2 bg-red-50 text-red-300 rounded-xl hover:text-red-600 hover:bg-red-100 transition-colors">
                        <XCircle size={18} />
                    </button>
                </div>
              </div>

              {/* Informações de Pagamento e Endereço */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex items-center gap-2">
                    {order.paymentMethod === 'PIX' ? <QrCode size={14} className="text-blue-500" /> : 
                     order.paymentMethod === 'CARTAO' ? <CreditCard size={14} className="text-green-500" /> : 
                     <Banknote size={14} className="text-orange-500" />}
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{order.paymentMethod || 'Pend.'}</span>
                  </div>
                  {order.changeFor && (
                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-600">Troco: R$ {order.changeFor.toFixed(2)}</span>
                      </div>
                  )}
              </div>

              {order.deliveryAddress && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2">
                    <MapPin size={16} className="text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-purple-800 font-medium leading-tight uppercase">{order.deliveryAddress}</p>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="flex-1 space-y-2 mb-6 max-h-40 overflow-y-auto custom-scrollbar px-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">
                        <strong className="text-orange-500 mr-1">{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-2 italic">
                    <MessageSquare size={14} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-800 leading-tight">"{order.notes}"</p>
                </div>
              )}

              {/* Rodapé e Ações */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-end mb-4">
                   <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total</p>
                        <p className="text-2xl font-brand font-bold text-[#3d251e]">R$ {order.total.toFixed(2)}</p>
                   </div>
                   <div className={`px-3 py-1 rounded-lg text-[10px] font-bold ${order.status === 'PREPARANDO' ? 'text-orange-500 bg-orange-50' : 'text-green-500 bg-green-50'}`}>
                        {order.status}
                   </div>
                </div>
                
                <div className="flex gap-2">
                    {order.status === 'PREPARANDO' ? (
                        <button 
                            onClick={() => handleStatusUpdate(order.id, 'PRONTO')}
                            className="flex-1 py-4 bg-[#f68c3e] text-white rounded-2xl font-bold text-xs hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={16} /> Marcar como Pronto
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleStatusUpdate(order.id, 'ENTREGUE')}
                            className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold text-xs hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} /> Finalizar Atendimento
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Impressão Térmica Oculta */}
      {printOrder && (
          <div id="thermal-receipt">
              <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
                  <h1 style={{ fontSize: '16pt', margin: 0 }}>{settings.storeName}</h1>
                  <p style={{ fontSize: '8pt', margin: '1mm 0' }}>{new Date(printOrder.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ borderTop: '1px dashed #000', padding: '2mm 0' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>PEDIDO #{printOrder.id.slice(-5).toUpperCase()}</p>
                  <p style={{ fontSize: '14pt', margin: '1mm 0' }}>{printOrder.type} {printOrder.tableNumber ? `- MESA ${printOrder.tableNumber}` : ''}</p>
                  {printOrder.deliveryAddress && <p style={{ fontSize: '8pt' }}>ENDEREÇO: {printOrder.deliveryAddress}</p>}
              </div>
              <div style={{ borderTop: '1px dashed #000', padding: '2mm 0' }}>
                  {printOrder.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                          <span>{it.quantity}x {it.name.slice(0, 18)}</span>
                          <span>R$ {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                  ))}
              </div>
              <div style={{ borderTop: '1px solid #000', paddingTop: '2mm', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>TOTAL:</span>
                  <span style={{ fontSize: '14pt' }}>R$ {printOrder.total.toFixed(2)}</span>
              </div>
              <p style={{ textAlign: 'center', marginTop: '4mm', fontSize: '8pt' }}>PGTO: {printOrder.paymentMethod} {printOrder.notes ? `\nOBS: ${printOrder.notes}` : ''}</p>
          </div>
      )}
    </div>
  );
};

export default OrdersList;
