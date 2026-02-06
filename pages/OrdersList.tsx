
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

// Interface para pedidos agrupados visualmente
interface GroupedOrder {
  id: string; // ID do primeiro pedido ou identificador da mesa
  originalOrderIds: string[]; // Lista de todos os IDs de pedidos reais
  type: OrderType;
  tableNumber?: string;
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

  // Lógica de Agrupamento
  const displayGroups = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'ENTREGUE' && o.status !== 'CANCELADO');
    const filtered = activeOrders.filter(o => filterType === 'TODOS' || o.type === filterType);
    
    const groups: Record<string, GroupedOrder> = {};

    filtered.forEach(order => {
      // Chave de agrupamento: Mesa para mesas, ou ID único para outros tipos (ou cliente se existisse)
      const groupKey = (order.type === 'MESA' && order.tableNumber) 
        ? `MESA-${order.tableNumber}` 
        : order.id;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: order.id,
          originalOrderIds: [order.id],
          type: order.type,
          tableNumber: order.tableNumber,
          items: [...order.items],
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          deliveryAddress: order.deliveryAddress,
          notes: order.notes ? [order.notes] : [],
          changeFor: order.changeFor
        };
      } else {
        const group = groups[groupKey];
        group.originalOrderIds.push(order.id);
        group.total += order.total;
        if (order.createdAt < group.createdAt) group.createdAt = order.createdAt;
        if (order.notes) group.notes.push(order.notes);
        if (order.changeFor) group.changeFor = (group.changeFor || 0) + order.changeFor;
        
        // Se qualquer pedido do grupo estiver PREPARANDO, o status do grupo é PREPARANDO
        if (order.status === 'PREPARANDO') group.status = 'PREPARANDO';

        // Somar itens repetidos
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
    try {
        // Atualiza todos os pedidos que compõem este grupo
        await Promise.all(group.originalOrderIds.map(id => updateStatus(id, newStatus)));
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

      {displayGroups.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">Nenhum pedido ativo no momento</h3>
            <p className="text-sm text-gray-300">Os novos pedidos aparecerão aqui instantaneamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGroups.map(group => (
            <div key={group.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all animate-scale-up relative group">
              
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      group.type === 'MESA' ? 'bg-blue-50 text-blue-600' : 
                      group.type === 'ENTREGA' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                  }`}>
                      {group.type} {group.tableNumber && `(Mesa ${group.tableNumber})`}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-400">Desde {new Date(group.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {group.originalOrderIds.length > 1 && (
                      <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black">{group.originalOrderIds.length} PEDIDOS</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handlePrint(group)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-black hover:bg-gray-100 transition-colors">
                        <Printer size={18} />
                    </button>
                    <button onClick={() => handleStatusUpdate(group, 'CANCELADO')} className="p-2 bg-red-50 text-red-300 rounded-xl hover:text-red-600 hover:bg-red-100 transition-colors">
                        <XCircle size={18} />
                    </button>
                </div>
              </div>

              {/* Informações de Pagamento e Endereço */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex items-center gap-2">
                    {group.paymentMethod === 'PIX' ? <QrCode size={14} className="text-blue-500" /> : 
                     group.paymentMethod === 'CARTAO' ? <CreditCard size={14} className="text-green-500" /> : 
                     <Banknote size={14} className="text-orange-500" />}
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{group.paymentMethod || 'Pend.'}</span>
                  </div>
                  {group.changeFor && (
                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-600">Troco: R$ {group.changeFor.toFixed(2)}</span>
                      </div>
                  )}
              </div>

              {group.deliveryAddress && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2">
                    <MapPin size={16} className="text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-purple-800 font-medium leading-tight uppercase">{group.deliveryAddress}</p>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="flex-1 space-y-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar px-1">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1">
                    <span className="text-gray-700 font-medium">
                        <strong className="text-orange-500 mr-1">{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {group.notes.length > 0 && (
                <div className="mb-4 space-y-2">
                    {group.notes.map((note, nIdx) => (
                        <div key={nIdx} className="p-2 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-2 italic">
                            <MessageSquare size={12} className="text-yellow-600 shrink-0 mt-1" />
                            <p className="text-[10px] text-yellow-800 leading-tight">"{note}"</p>
                        </div>
                    ))}
                </div>
              )}

              {/* Rodapé e Ações */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-end mb-4">
                   <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Acumulado</p>
                        <p className="text-2xl font-brand font-bold text-[#3d251e]">R$ {group.total.toFixed(2)}</p>
                   </div>
                   <div className={`px-3 py-1 rounded-lg text-[10px] font-bold ${group.status === 'PREPARANDO' ? 'text-orange-500 bg-orange-50' : 'text-green-500 bg-green-50'}`}>
                        {group.status}
                   </div>
                </div>
                
                <div className="flex gap-2">
                    {group.status === 'PREPARANDO' ? (
                        <button 
                            onClick={() => handleStatusUpdate(group, 'PRONTO')}
                            className="flex-1 py-4 bg-[#f68c3e] text-white rounded-2xl font-bold text-xs hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={16} /> Marcar como Pronto
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleStatusUpdate(group, 'ENTREGUE')}
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
                  <p style={{ fontSize: '8pt', margin: '1mm 0' }}>{new Date().toLocaleString()}</p>
              </div>
              <div style={{ borderTop: '1px dashed #000', padding: '2mm 0' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>EXTRATO DE MESA / PEDIDO</p>
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
              <div style={{ marginTop: '2mm', fontSize: '8pt' }}>
                  <p>PGTO: {printOrder.paymentMethod || 'PENDENTE'}</p>
                  {printOrder.notes.map((n, i) => <p key={i}>OBS {i+1}: {n}</p>)}
              </div>
              <p style={{ textAlign: 'center', marginTop: '4mm', fontSize: '7pt' }}>Obrigado pela preferência!</p>
          </div>
      )}
    </div>
  );
};

export default OrdersList;
