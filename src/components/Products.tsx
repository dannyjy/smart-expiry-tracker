
import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import { inventoryService } from '../services/api';
import { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', min_stock_level: '10' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => inventoryService.getProducts().then(setProducts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await inventoryService.addProduct({
      name: formData.name,
      category: formData.category,
      min_stock_level: parseInt(formData.min_stock_level)
    });
    setFormData({ name: '', category: '', min_stock_level: '10' });
    setShowAddForm(false);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Directory</h2>
          <p className="text-slate-500 text-sm">Manage base products and their threshold settings.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Register Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
              <input 
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <input 
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Stock</label>
              <div className="flex gap-2">
                <input 
                  required
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={formData.min_stock_level}
                  onChange={e => setFormData({...formData, min_stock_level: e.target.value})}
                />
                <button type="submit" className="px-6 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Save</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Min Threshold</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">#P{p.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                <td className="px-6 py-4 text-slate-500">{p.category}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                    {p.min_stock_level} Units
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400">
                    <button className="p-1 hover:text-indigo-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
