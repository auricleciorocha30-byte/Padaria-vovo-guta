
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Camera, Star, Tag, X, Loader2, Weight, Power } from 'lucide-react';
import { Switch } from '../components/Switch';

interface Props {
  products: Product[];
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  categories: string[];
  setCategories: (c: string[]) => void;
}

const MenuManagement: React.FC<Props> = ({ products, saveProduct, deleteProduct, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);

    try {
        const productData = {
            id: editingProduct.id || Math.random().toString(36).substr(2, 9),
            name: editingProduct.name || '',
            description: editingProduct.description || '',
            price: editingProduct.price || 0,
            category: editingProduct.category || categories[0] || 'Geral',
            imageUrl: editingProduct.imageUrl || 'https://picsum.photos/400/300',
            isActive: editingProduct.isActive !== false,
            featuredDay: editingProduct.featuredDay === -1 ? undefined : editingProduct.featuredDay,
            isByWeight: !!editingProduct.isByWeight
        };

        await saveProduct(productData as Product);
        setShowProductModal(false);
        setEditingProduct(null);
    } catch (err) {
        alert("Erro ao salvar produto.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este produto?")) {
        try {
            await deleteProduct(id);
        } catch (err) {
            alert("Erro ao excluir produto.");
        }
    }
  };

  const days = [
    { id: 0, name: "Domingo" }, { id: 1, name: "Segunda" }, { id: 2, name: "Terça" },
    { id: 3, name: "Quarta" }, { id: 4, name: "Quinta" }, { id: 5, name: "Sexta" }, { id: 6, name: "Sábado" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none"
          />
        </div>
        <button 
            onClick={() => { setEditingProduct({ category: categories[0] || '', description: '', featuredDay: -1, isActive: true, isByWeight: false }); setShowProductModal(true); }}
            className="px-6 py-3 bg-[#f68c3e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-md w-full md:w-auto"
        >
            <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(product => (
          <div key={product.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative ${!product.isActive ? 'opacity-50 grayscale' : ''}`}>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="p-2 bg-white rounded-lg shadow text-blue-500 hover:bg-blue-50">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-lg shadow text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
            {!product.isActive && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 pointer-events-none">
                    <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg rotate-12 uppercase">Fora de Estoque</span>
                </div>
            )}
            {product.isByWeight && (
                <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-md flex items-center gap-1 uppercase">
                    <Weight size={10} /> KG
                </div>
            )}
            <img src={product.imageUrl} className="w-full h-40 object-cover" alt={product.name} />
            <div className="p-4">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  {product.featuredDay !== undefined && <Star size={14} className="text-yellow-500 fill-current" />}
              </div>
              <h3 className="font-bold text-gray-800 mt-2">{product.name}</h3>
              <p className="text-sm font-bold text-[#3d251e] mt-1">R$ {product.price.toFixed(2)} {product.isByWeight ? '/ KG' : ''}</p>
            </div>
          </div>
        ))}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold">{editingProduct?.id ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400"><X /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-between border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Power size={18} className={editingProduct?.isActive ? 'text-green-600' : 'text-gray-400'} />
                        <span className="text-[10px] font-bold uppercase text-gray-500">Ativo</span>
                      </div>
                      <Switch checked={editingProduct?.isActive ?? true} onChange={(v) => setEditingProduct({...editingProduct, isActive: v})} />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Weight size={18} className={editingProduct?.isByWeight ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="text-[10px] font-bold uppercase text-gray-500">Por KG</span>
                      </div>
                      <Switch checked={editingProduct?.isByWeight ?? false} onChange={(v) => setEditingProduct({...editingProduct, isByWeight: v})} />
                  </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer overflow-hidden relative">
                  {editingProduct?.imageUrl ? ( <img src={editingProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" /> ) : ( <> <Camera size={24} /> <span className="text-[10px]">Foto</span> </> )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setEditingProduct({...editingProduct, imageUrl: reader.result as string});
                        reader.readAsDataURL(file);
                       }
                  }} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                  <input required type="text" value={editingProduct?.name || ''} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                <textarea 
                  rows={2} 
                  value={editingProduct?.description || ''} 
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm" 
                  placeholder="Descreva o produto ou ingredientes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{editingProduct?.isByWeight ? 'Preço/KG' : 'Preço/UN'}</label>
                  <input required type="number" step="0.01" value={editingProduct?.price || ''} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                  <select required value={editingProduct?.category || ''} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#3d251e] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"> 
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar'} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
