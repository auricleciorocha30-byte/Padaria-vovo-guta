
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Product, OrderType, OrderItem, StoreSettings } from '../types';
import { Clock, CheckCircle, XCircle, ShoppingBag, MapPin, Printer, CreditCard, Banknote, MessageSquare, Hash, Truck, Utensils, User, Phone, ExternalLink, Weight } from 'lucide-react';

interface Props {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  products: Product[];
  addOrder: (order: Order) => void;
  settings: StoreSettings;
}

interface GroupedOrder {
  id: string;
  originalOrderIds: string[];
  type: OrderType;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: number;
  paymentMethod?: string;
  deliveryAddress?: string;
  notes: string[];
  changeFor?: number;
}

const OrdersList: React.FC<Props> = ({ orders, updateStatus, products, addOrder, settings }) => {
  const [filterType, setFilterType] = useState<'TODOS' | OrderType>('TODOS');
  const [printOrder, setPrintOrder] = useState<GroupedOrder | null>(null);

  const displayGroups = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'ENTREGUE' && o.status !== 'CANCELADO');
    const filtered = activeOrders.filter(o => filterType === 'TODOS' || o.type === filterType);
    
    const groups: Record<string, GroupedOrder> = {};

    filtered.forEach(order => {
      const groupKey = (order.type === 'MESA' && order.tableNumber) 
        ? `MESA-${order.tableNumber}` 
        : order.id;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: order.id,
          originalOrderIds: [order.id],
          type: order.type,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: [...order.items],
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          deliveryAddress: order.deliveryAddress,
          notes: order.notes && order.notes.trim() !== "" ? [order.notes] : [],
          changeFor: order.changeFor
        };
      } else {
        const group = groups[groupKey];
        group.originalOrderIds.push(order.id);
        group.total += order.total;
        if (order.createdAt < group.createdAt) group.createdAt = order.createdAt;
        if (order.notes && order.notes.trim() !== "") group.notes.push(order.notes);
        if (order.changeFor) group.changeFor = (group.changeFor || 0) + order.changeFor;
        if (order.status === 'PREPARANDO') group.status = 'PREPARANDO';

        order.items.forEach(newItem => {
          const existingItem = group.items.find(i => i.productId === newItem.productId);
          if (existingItem) {
            existingItem.quantity += newItem.quantity;
          } else {
            group.items.push({ ...newItem });
          }
        });
      }
    });

    return Object.values(groups).sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, filterType]);

  const handlePrint = (group: GroupedOrder) => {
    setPrintOrder(group);
    setTimeout(() => { window.print(); setPrintOrder(null); }, 200);
  };

  const handleStatusUpdate = async (group: GroupedOrder, newStatus: OrderStatus) => {
    await Promise.all(group.originalOrderIds.map(id => updateStatus(id, newStatus)));
  };

  const openWhatsApp = (phone: string, name?: string) => {
      const cleanPhone = phone.replace(/\D/g, '');
      const text = encodeURIComponent(`Olá ${name || 'cliente'}, seu pedido já está pronto!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
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

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['TODOS', 'MESA', 'BALCAO', 'ENTREGA'].map(f => (
            <button key={f} onClick={() => setFilterType(f as any)} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm border transition-all ${filterType === f ? 'bg-[#3d251e] text-white border-[#3d251e]' : 'bg-white text-gray-400 border-gray-100'}`}>
                {f === 'MESA' ? <Utensils size={14}/> : f === 'ENTREGA' ? <Truck size={14}/> : f === 'BALCAO' ? <ShoppingBag size={14}/> : <Hash size={14}/>} {f}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGroups.map(group => (
          <div key={group.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all relative">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${group.type === 'MESA' ? 'bg-blue-50 text-blue-600' : group.type === 'ENTREGA' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                    {group.type} {group.tableNumber && `(Mesa ${group.tableNumber})`}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={12} className="text-gray-300" />
                  <span className="text-xs font-bold text-gray-400">{new Date(group.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  <span className="text-[10px] font-mono text-gray-300">#{group.id}</span>
                </div>
              </div>
              <div className="flex gap-1">
                  <button onClick={() => handlePrint(group)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-black"><Printer size={18} /></button>
                  <button onClick={() => handleStatusUpdate(group, 'CANCELADO')} className="p-2 bg-red-50 text-red-300 rounded-xl hover:text-red-600"><XCircle size={18} /></button>
              </div>
            </div>

            {(group.customerName || group.customerPhone) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1"><User size={14} className="text-gray-400"/> <span className="text-xs font-bold text-gray-700 uppercase">{group.customerName || 'Cliente'}</span></div>
                    {group.customerPhone && (
                        <button onClick={() => openWhatsApp(group.customerPhone!, group.customerName)} className="flex items-center gap-2 text-green-600 hover:underline">
                            <Phone size={14}/> <span className="text-xs font-bold">{group.customerPhone}</span> <ExternalLink size={10}/>
                        </button>
                    )}
                </div>
            )}

            {group.deliveryAddress && (
              <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2">
                  <MapPin size={16} className="text-purple-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-purple-800 font-black leading-tight uppercase">{group.deliveryAddress}</p>
              </div>
            )}

            <div className="flex-1 space-y-2 mb-6 max-h-48 overflow-y-auto px-1 custom-scrollbar">
              {group.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1">
                  <span className="text-gray-700 flex items-center gap-1">
                    <strong className="text-orange-500 mr-1 flex items-center gap-1">
                        {item.isByWeight ? (
                             <><Weight size={12}/> {(item.quantity * 1000).toFixed(0)}g</>
                        ) : (
                             <>{item.quantity}x</>
                        )}
                    </strong> 
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {group.notes.length > 0 && (
              <div className="mb-4 space-y-2">
                  {group.notes.map((note, nIdx) => (
                      <div key={nIdx} className="p-3 bg-yellow-100 rounded-xl border border-yellow-200 flex items-start gap-3 shadow-sm">
                          <MessageSquare size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-yellow-800 uppercase tracking-tighter">Observação:</p>
                            <p className="text-xs text-yellow-900 font-bold leading-tight">"{note}"</p>
                          </div>
                      </div>
                  ))}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-end mb-4">
                 <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Acumulado</p>
                      <p className="text-2xl font-brand font-bold text-[#3d251e]">R$ {group.total.toFixed(2)}</p>
                 </div>
                 <div className={`px-3 py-1 rounded-lg text-[10px] font-bold ${group.status === 'PREPARANDO' ? 'text-orange-500 bg-orange-50' : 'text-green-500 bg-green-50'}`}>{group.status}</div>
              </div>
              
              <div className="flex gap-2">
                  {group.status === 'PREPARANDO' ? (
                      <button onClick={() => handleStatusUpdate(group, 'PRONTO')} className="flex-1 py-4 bg-[#f68c3e] text-white rounded-2xl font-bold text-xs hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2"><CheckCircle size={16} /> Marcar Pronto</button>
                  ) : (
                      <button onClick={() => handleStatusUpdate(group, 'ENTREGUE')} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold text-xs hover:bg-green-700 shadow-lg flex items-center justify-center gap-2"><ShoppingBag size={16} /> Finalizar</button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {printOrder && (
          <div id="thermal-receipt">
              <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
                  <h1 style={{ fontSize: '14pt', margin: 0 }}>{settings.storeName}</h1>
                  <p style={{ fontSize: '8pt' }}>{new Date().toLocaleString()}</p>
              </div>
              <div style={{ borderTop: '1px dashed #000', padding: '2mm 0' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{printOrder.type} - #{printOrder.id}</p>
                  {printOrder.customerName && <p style={{ fontSize: '9pt' }}>CLIENTE: {printOrder.customerName}</p>}
                  {printOrder.tableNumber && <p style={{ fontSize: '9pt' }}>MESA: {printOrder.tableNumber}</p>}
              </div>
              <div style={{ borderTop: '1px dashed #000', padding: '2mm 0' }}>
                  {printOrder.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{it.isByWeight ? `${(it.quantity * 1000).toFixed(0)}g` : `${it.quantity}x`} {it.name.slice(0, 15)}</span>
                          <span>R$ {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                  ))}
              </div>
              <div style={{ borderTop: '1px solid #000', paddingTop: '2mm', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>TOTAL:</span>
                  <span>R$ {printOrder.total.toFixed(2)}</span>
              </div>
              {printOrder.notes.length > 0 && (
                <div style={{ marginTop: '2mm', fontSize: '8pt', borderTop: '1px dashed #ccc', paddingTop: '1mm' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>OBSERVAÇÕES:</p>
                    {printOrder.notes.map((n, i) => <p key={i} style={{ margin: 0 }}>- {n}</p>)}
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default OrdersList;
