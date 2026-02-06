
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5e1] p-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#f68c3e] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#3d251e] rounded-full opacity-10 blur-3xl"></div>

      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 border border-orange-100">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-[#3d251e] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
            <img 
              src="https://images.tcdn.com.br/img/img_prod/1126742/1665494238_logo_vovo_guta_2.jpg" 
              className="w-full h-full object-cover p-2"
              alt="Logo"
            />
          </div>
          <h1 className="text-3xl font-brand font-bold text-[#3d251e]">Acesso Restrito</h1>
          <p className="text-sm text-gray-400 mt-2">Entre com suas credenciais para gerenciar a loja</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-4 tracking-widest">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-700"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-4 tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#3d251e] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50 mt-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Entrar no Sistema
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">Vovó Guta - Gestão Gastronômica</p>
          <div className="flex justify-center gap-4 grayscale opacity-30">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
