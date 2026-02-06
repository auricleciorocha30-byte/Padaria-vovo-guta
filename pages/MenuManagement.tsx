
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Camera, Star, CheckCircle, XCircle, Tag, X, AlignLeft, Loader2 } from 'lucide-react';
import { Switch } from '../components/Switch';

interface Props {
  products: Product[];
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  categories: string[];
  setCategories: (c: string[]) => void;
}

const MenuManagement: React.FC<Props> = ({ products, saveProduct, deleteProduct, categories, setCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
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
            isActive: editingProduct.isActive ?? true,
            featuredDay: editingProduct.featuredDay === -1 ? undefined : editingProduct.featuredDay
        };

        // If setting a featuredDay, we should ideally handle the "only one per day" logic
        // But the Supabase Realtime will sync other products if we changed them.
        // For simplicity and to avoid race conditions, we save the current one.
        await saveProduct(productData as Product);
        
        setShowProductModal(false);
        setEditingProduct(null);
    } catch (err) {
        alert("Erro ao salvar produto. Tente novamente.");
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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
        alert("Esta categoria já existe.");
        return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const days = [
    { id: 0, name: "Domingo" },
    { id: 1, name: "Segunda" },
    { id: 2, name: "Terça" },
    { id: 3, name: "Quarta" },
    { id: 4, name: "Quinta" },
    { id: 5, name: "Sexta" },
    { id: 6, name: "Sábado" }
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
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="flex flex-col w-full md:w-auto gap-2">
            <button 
                onClick={() => { setEditingProduct({ category: categories[0] || '', description: '', featuredDay: -1, isActive: true }); setShowProductModal(true); }}
                className="px-6 py-3 bg-[#f68c3e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-md"
            >
                <Plus size={20} /> Novo Produto
            </button>
            <button 
                onClick={() => setShowCategoryModal(true)}
                className="px-6 py-2 bg-white text-gray-600 border border-gray-200 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
            >
                <Tag size={16} /> Gerenciar Categorias
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(product => (
          <div key={product.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative ${!product.isActive ? 'opacity-60 grayscale' : ''}`}>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="p-2 bg-white rounded-lg shadow text-blue-500 hover:bg-blue-50">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-lg shadow text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>

            {product.featuredDay !== undefined && product.featuredDay !== -1 && (
                <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> OFERTA: {days.find(d => d.id === product.featuredDay)?.name}
                </div>
            )}
            
            <img src={product.imageUrl} className="w-full h-40 object-cover" alt={product.name} />
            
            <div className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">
                {product.category}
              </span>
              <h3 className="font-bold text-gray-800 mt-2">{product.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-1 mb-1">{product.description}</p>
              <p className="text-sm font-bold text-[#3d251e] mt-1">R$ {product.price.toFixed(2)}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className={`flex items-center gap-1 text-[10px] font-bold ${product.isActive ? 'text-green-500' : 'text-red-500'}`}>
                    {product.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {product.isActive ? 'ATIVO' : 'INATIVO'}
                </div>
              </div>
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
              <div className="flex gap-4 items-center mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 cursor-pointer overflow-hidden relative">
                  {editingProduct?.imageUrl ? (
                    <img src={editingProduct.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={24} />
                      <span className="text-[10px]">Upload</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setEditingProduct({...editingProduct, imageUrl: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                       }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                  <input 
                    required
                    type="text" 
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                    placeholder="Ex: Pão de Leite"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <AlignLeft size={12} /> Descrição do Produto
                </label>
                <textarea 
                  required
                  rows={3}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-orange-500 bg-gray-50/50 resize-none text-sm"
                  placeholder="Descreva os ingredientes, tamanho ou detalhes especiais..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço</label>
                  <input 
                    required
                    type="number" step="0.01"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Em Estoque</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Switch 
                        checked={editingProduct?.isActive ?? true}
                        onChange={(v) => setEditingProduct({...editingProduct, isActive: v})}
                    />
                    <span className="text-sm font-medium">{editingProduct?.isActive ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                  <select 
                      required
                      value={editingProduct?.category || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500 bg-white"
                  >
                      <option value="" disabled>Selecione</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <Star size={10} className="text-yellow-500" fill="currentColor" /> Oferta do Dia
                  </label>
                  <select 
                    value={editingProduct?.featuredDay ?? -1}
                    onChange={(e) => setEditingProduct({...editingProduct, featuredDay: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="-1">Nenhum</option>
                    {days.map((day) => <option key={day.id} value={day.id}>{day.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#3d251e] text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Tag className="text-orange-500" /> Categorias
                    </h2>
                    <button onClick={() => setShowCategoryModal(false)} className="text-gray-400"><X /></button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            placeholder="Nova categoria..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#f68c3e] text-white font-bold rounded-lg hover:bg-orange-600">
                            Adicionar
                        </button>
                    </form>
                    <div className="space-y-2 max-h-64 overflow-auto">
                        {categories.map(cat => (
                            <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                                <span className="font-medium text-gray-700">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-center">
                    <button onClick={() => setShowCategoryModal(false)} className="text-sm font-bold text-[#3d251e] uppercase tracking-wider">Fechar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
