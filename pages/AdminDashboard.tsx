
import React from 'react';
import { Order, Product } from '../types';
import { TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  orders: Order[];
  products: Product[];
}

const AdminDashboard: React.FC<Props> = ({ orders, products }) => {
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  
  const data = [
    { name: 'Seg', sales: 400 },
    { name: 'Ter', sales: 300 },
    { name: 'Qua', sales: 600 },
    { name: 'Qui', sales: 800 },
    { name: 'Sex', sales: 500 },
    { name: 'Sáb', sales: 900 },
    { name: 'Dom', sales: 700 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total em Vendas" value={`R$ ${totalSales.toFixed(2)}`} icon={<DollarSign className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Pedidos Hoje" value={totalOrders.toString()} icon={<ShoppingBag className="text-orange-600" />} color="bg-orange-50" />
        <StatCard title="Novos Clientes" value="12" icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Crescimento" value="+15.3%" icon={<TrendingUp className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-800">Vendas na Semana</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
              <Calendar size={14} /> Últimos 7 dias
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#f68c3e' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Produtos Populares</h2>
          <div className="space-y-4">
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">0{i+1}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </div>
                <p className="text-sm font-bold text-orange-600">+{Math.floor(Math.random()*50)}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-widest">
            Ver Todos
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
