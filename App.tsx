
import React, { useState, useEffect, useMemo } from 'react';
// Added Outlet to the imports from react-router-dom
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingCart, 
  Tv, 
  Settings, 
  PlusCircle, 
  Users, 
  Ticket,
  Star,
  ChevronRight,
  LogOut,
  Menu as MenuIcon,
  UserRound,
  CalendarDays,
  Loader2,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Product, Order, StoreSettings, Coupon, OrderStatus, OrderType } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './constants';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import OrdersList from './pages/OrdersList';
import StoreSettingsPage from './pages/StoreSettingsPage';
import DigitalMenu from './pages/DigitalMenu';
import TVBoard from './pages/TVBoard';
import TableLogin from './pages/TableLogin';
import WaitressPanel from './pages/WaitressPanel';
import WeeklyOffers from './pages/WeeklyOffers';
import LoginPage from './pages/LoginPage';
import WaitstaffManagement from './pages/WaitstaffManagement';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(['Padaria', 'Confeitaria', 'Bebidas', 'Lanches']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isWaitstaff, setIsWaitstaff] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pRes, cRes, oRes, sRes] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('orders').select('*').order('createdAt', { ascending: false }),
          supabase.from('settings').select('data').eq('id', 'store').single()
        ]);

        if (pRes.data) setProducts(pRes.data);
        if (cRes.data) setCategories(cRes.data.map((c: any) => c.name));
        if (oRes.data) setOrders(oRes.data);
        if (sRes.data) setSettings(sRes.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchInitialData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addOrder = async (order: Order) => {
    const { error } = await supabase.from('orders').insert(order);
    if (!error) setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await supabase.from('settings').upsert({ id: 'store', data: newSettings });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5e1]">
        <Loader2 className="animate-spin text-[#3d251e]" size={48} />
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />

        <Route path="/" element={session ? <AdminLayout settings={settings} /> : <Navigate to="/login" />}>
          <Route index element={<AdminDashboard orders={orders} products={products} />} />
          <Route path="cardapio-admin" element={<MenuManagement products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} />} />
          <Route path="pedidos" element={<OrdersList orders={orders} updateStatus={updateOrderStatus} products={products} addOrder={addOrder} settings={settings} />} />
          <Route path="garcom" element={<WaitstaffManagement settings={settings} onUpdateSettings={handleUpdateSettings} />} />
          <Route path="ofertas" element={<WeeklyOffers products={products} setProducts={setProducts} />} />
          <Route path="configuracoes" element={<StoreSettingsPage settings={settings} setSettings={handleUpdateSettings} />} />
        </Route>

        <Route path="/mesa/login" element={<TableLogin onLogin={(t) => { setActiveTable(t); setIsWaitstaff(false); }} />} />
        <Route path="/garconete" element={<WaitressPanel onSelectTable={(t) => { setActiveTable(t); setIsWaitstaff(true); }} />} />
        <Route path="/cardapio" element={<DigitalMenu products={products} categories={categories} settings={settings} orders={orders} addOrder={addOrder} tableNumber={activeTable} onLogout={() => { setActiveTable(null); setIsWaitstaff(false); }} isWaitstaff={isWaitstaff} />} />
        <Route path="/tv" element={<TVBoard orders={orders} settings={settings} />} />
      </Routes>
    </HashRouter>
  );
}

function AdminLayout({ settings }: { settings: StoreSettings }) {
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/pedidos', icon: <ShoppingCart size={20} />, label: 'Pedidos' },
    { path: '/cardapio-admin', icon: <PlusCircle size={20} />, label: 'Gerenciar Cardápio' },
    { path: '/configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#3d251e] text-white hidden md:flex flex-col border-r border-gray-800">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-[#f68c3e] flex items-center justify-center overflow-hidden">
             <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-brand text-lg font-bold">{settings.storeName}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-[#f68c3e] text-white shadow-md' : 'hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <Link to="/garcom" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/garcom' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            <ShieldCheck size={20} />
            <span className="font-bold">Gerenc. Garçom</span>
          </Link>
          <Link to="/ofertas" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/ofertas' ? 'bg-orange-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            <CalendarDays size={20} />
            <span className="font-bold">Ofertas da Semana</span>
          </Link>
          <Link to="/garconete" target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-colors border border-orange-600/30">
            <UserRound size={20} />
            <span className="font-bold">Painel Garçonete</span>
          </Link>
          <Link to="/cardapio" target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Utensils size={20} />
            <span>Cardápio Digital</span>
          </Link>
          <Link to="/tv" target="_blank" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-orange-400">
            <Tv size={20} />
            <span>Painel TV</span>
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            Sair do Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {location.pathname === '/garcom' ? 'Gerenciamento de Garçom' : 
             navItems.find(i => i.path === location.pathname)?.label || 'Painel Administrativo'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Gerente</p>
              <p className="text-xs text-gray-500">Unidade Matriz</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img src={settings.logoUrl} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8">
          <React.Suspense fallback={<div>Carregando...</div>}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}
