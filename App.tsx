
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  PlusCircle, 
  LogOut,
  Loader2,
  UserRound,
  ExternalLink,
  Utensils,
  Tv
} from 'lucide-react';
import { supabase } from './lib/supabase.ts';
import { Product, Order, StoreSettings, OrderStatus } from './types.ts';
import { INITIAL_SETTINGS } from './constants.ts';

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

// URLs dos sons de alerta
const SOUNDS = {
  NEW_ORDER: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Sino de notificação
  ORDER_READY: 'https://assets.mixkit.co/active_storage/sfx/2218/2218-preview.mp3' // Ding de conclusão
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isWaitstaff, setIsWaitstaff] = useState(false);

  const playSound = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.play().catch(e => console.log('Interação do usuário necessária para áudio:', e));
    } catch (e) {
      console.error('Erro ao reproduzir som:', e);
    }
  };

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

    // CONFIGURAÇÃO REALTIME SUPABASE OTIMIZADA
    const channel = supabase
      .channel('vovo-guta-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          setOrders(prev => {
            const exists = prev.some(o => o.id === newOrder.id);
            if (exists) return prev;
            return [newOrder, ...prev];
          });
          // ALERTA: NOVO PEDIDO
          playSound(SOUNDS.NEW_ORDER);
        } else if (payload.eventType === 'UPDATE') {
          const oldOrder = payload.old as Order;
          const newOrder = payload.new as Order;
          
          setOrders(prev => prev.map(o => o.id === newOrder.id ? newOrder : o));

          // ALERTA: PEDIDO FICOU PRONTO
          // Verifica se o status mudou especificamente para 'PRONTO'
          if (newOrder.status === 'PRONTO' && oldOrder.status !== 'PRONTO') {
            playSound(SOUNDS.ORDER_READY);
          }
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') setProducts(prev => [...prev, payload.new as Product]);
        if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? (payload.new as Product) : p));
        if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const addOrder = async (order: Order) => {
    const payload = {
      id: order.id || Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: order.type || 'BALCAO',
      items: order.items,
      total: order.total,
      status: order.status || 'PREPARANDO',
      createdAt: order.createdAt || Date.now(),
      tableNumber: order.tableNumber || null,
      paymentMethod: order.paymentMethod || 'PIX',
      notes: order.notes || null
    };

    const { error } = await supabase.from('orders').insert(payload);
    if (error) {
      console.error("Erro Supabase ao adicionar pedido:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
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
          <Route path="cardapio-admin" element={<MenuManagement products={products} saveProduct={async (p) => { await supabase.from('products').upsert(p); }} deleteProduct={async (id) => { await supabase.from('products').delete().eq('id', id); }} categories={categories} setCategories={setCategories} />} />
          <Route path="pedidos" element={<OrdersList orders={orders} updateStatus={updateOrderStatus} products={products} addOrder={addOrder} settings={settings} />} />
          <Route path="garcom" element={<WaitstaffManagement settings={settings} onUpdateSettings={async (s) => { await supabase.from('settings').upsert({ id: 'store', data: s }); setSettings(s); }} />} />
          <Route path="ofertas" element={<WeeklyOffers products={products} saveProduct={async (p) => { await supabase.from('products').upsert(p); }} />} />
          <Route path="configuracoes" element={<StoreSettingsPage settings={settings} setSettings={async (s) => { await supabase.from('settings').upsert({ id: 'store', data: s }); setSettings(s); }} />} />
        </Route>

        <Route path="/mesa/login" element={<TableLogin onLogin={(t) => { setActiveTable(t); setIsWaitstaff(false); }} />} />
        <Route path="/garconete" element={<WaitressPanel orders={orders} onSelectTable={(t) => { setActiveTable(t); setIsWaitstaff(true); }} />} />
        <Route path="/cardapio" element={<DigitalMenu products={products} categories={categories} settings={settings} orders={orders} addOrder={addOrder} tableNumber={activeTable} onLogout={() => { setActiveTable(null); setIsWaitstaff(false); }} isWaitstaff={isWaitstaff} />} />
        <Route path="/tv" element={<TVBoard orders={orders} settings={settings} products={products} />} />
      </Routes>
    </HashRouter>
  );
}

function AdminLayout({ settings }: { settings: StoreSettings }) {
  const location = useLocation();
  const handleSignOut = async () => { await supabase.auth.signOut(); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#3d251e] text-white hidden md:flex flex-col border-r border-gray-800">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
          <span className="font-brand text-lg font-bold">{settings.storeName}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/' ? 'bg-[#f68c3e]' : 'hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/pedidos" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/pedidos' ? 'bg-[#f68c3e]' : 'hover:bg-white/5'}`}>
            <ShoppingCart size={20} /> Pedidos
          </Link>
          <Link to="/cardapio-admin" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/cardapio-admin' ? 'bg-[#f68c3e]' : 'hover:bg-white/5'}`}>
            <PlusCircle size={20} /> Cardápio
          </Link>
          <Link to="/configuracoes" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === '/configuracoes' ? 'bg-[#f68c3e]' : 'hover:bg-white/5'}`}>
            <Settings size={20} /> Ajustes
          </Link>

          <div className="pt-6 pb-2 px-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Acesso Externo</p>
          </div>
          
          <a href="#/cardapio" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-300 group">
            <div className="flex items-center gap-3">
              <Utensils size={20} /> <span>Cardápio Digital</span>
            </div>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          
          <a href="#/garconete" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-300 group">
            <div className="flex items-center gap-3">
              <UserRound size={20} /> <span>Painel Garçom</span>
            </div>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a href="#/tv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-300 group">
            <div className="flex items-center gap-3">
              <Tv size={20} /> <span>Painel TV</span>
            </div>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </nav>
        
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-bold"><LogOut size={18} /> Sair</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Vovó Guta Admin</h1>
          <img src={settings.logoUrl} className="w-10 h-10 rounded-full border border-gray-100" />
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
