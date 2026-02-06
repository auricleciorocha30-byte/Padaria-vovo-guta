
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingCart, 
  Tv, 
  Settings, 
  PlusCircle, 
  LogOut,
  UserRound,
  CalendarDays,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { supabase } from './lib/supabase.ts';
import { Product, Order, StoreSettings, OrderStatus } from './types.ts';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './constants.ts';

// Pages
import AdminDashboard from './pages/AdminDashboard.tsx';
import MenuManagement from './pages/MenuManagement.tsx';
import OrdersList from './pages/OrdersList.tsx';
import StoreSettingsPage from './pages/StoreSettingsPage.tsx';
import DigitalMenu from './pages/DigitalMenu.tsx';
import TVBoard from './pages/TVBoard.tsx';
import TableLogin from './pages/TableLogin.tsx';
import WaitressPanel from './pages/WaitressPanel.tsx';
import WeeklyOffers from './pages/WeeklyOffers.tsx';
import LoginPage from './pages/LoginPage.tsx';
import WaitstaffManagement from './pages/WaitstaffManagement.tsx';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isWaitstaff, setIsWaitstaff] = useState(false);

  // Initial Fetch and Realtime Subscriptions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pRes, cRes, oRes, sRes] = await Promise.all([
          supabase.from('products').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
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

    // REALTIME SUBSCRIPTIONS
    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as Order, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? (payload.new as Order) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [...prev, payload.new as Product]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? (payload.new as Product) : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        // Simpler to refetch categories to maintain order
        supabase.from('categories').select('name').then(res => {
          if (res.data) setCategories(res.data.map(c => c.name));
        });
      })
      .subscribe();

    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.store' }, (payload) => {
        setSettings(payload.new.data);
      })
      .subscribe();

    // Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  const addOrder = async (order: Order) => {
    // We only need to push to DB, Realtime listener will update local state
    const { error } = await supabase.from('orders').insert(order);
    if (error) console.error('Error adding order:', error);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) console.error('Error updating order status:', error);
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    // Realtime will update local state for all users
    await supabase.from('settings').upsert({ id: 'store', data: newSettings });
  };

  const updateProductList = async (newList: Product[]) => {
    // This is handled by each individual product's Realtime sync, 
    // but we can update state locally for immediate feedback in Admin
    setProducts(newList);
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
          <Route path="cardapio-admin" element={<MenuManagement products={products} setProducts={updateProductList} categories={categories} setCategories={setCategories} />} />
          <Route path="pedidos" element={<OrdersList orders={orders} updateStatus={updateOrderStatus} products={products} addOrder={addOrder} settings={settings} />} />
          <Route path="garcom" element={<WaitstaffManagement settings={settings} onUpdateSettings={handleUpdateSettings} />} />
          <Route path="ofertas" element={<WeeklyOffers products={products} setProducts={updateProductList} />} />
          <Route path="configuracoes" element={<StoreSettingsPage settings={settings} setSettings={handleUpdateSettings} />} />
        </Route>

        <Route path="/mesa/login" element={<TableLogin onLogin={(t) => { setActiveTable(t); setIsWaitstaff(false); }} />} />
        <Route path="/garconete" element={<WaitressPanel onSelectTable={(t) => { setActiveTable(t); setIsWaitstaff(true); }} />} />
        <Route path="/cardapio" element={<DigitalMenu products={products} categories={categories} settings={settings} orders={orders} addOrder={addOrder} tableNumber={activeTable} onLogout={() => { setActiveTable(null); setIsWaitstaff(false); }} isWaitstaff={isWaitstaff} />} />
        <Route path="/tv" element={<TVBoard orders={orders} settings={settings} products={products} />} />
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
          <div className="h-4"></div>
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
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold mt-4"
          >
            <LogOut size={18} />
            Sair do Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
            {location.pathname === '/garcom' ? 'Gerenciamento de Equipe' : 
             navItems.find(i => i.path === location.pathname)?.label || 'Vovó Guta Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Gerente</p>
              <p className="text-xs text-gray-500">Unidade Matriz</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                <img src={settings.logoUrl} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8">
          <React.Suspense fallback={<div>Carregando componentes...</div>}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}
