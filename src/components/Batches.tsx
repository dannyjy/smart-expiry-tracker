
import React, { useState, useEffect } from 'react';
import { PlusCircle, ShoppingBag, Calendar, Hash, DollarSign } from 'lucide-react';
import { inventoryService } from '../services/api';
import { Product } from '../types';

export default function Batches() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    batch_num: '',
    expiry_date: '',
    quantity: '',
    cost_per_unit: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    inventoryService.getProducts().then(setProducts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.addBatch({
        product_id: parseInt(formData.product_id),
        batch_num: formData.batch_num,
        expiry_date: new Date(formData.expiry_date).toISOString(),
        quantity: parseInt(formData.quantity),
        cost_per_unit: parseFloat(formData.cost_per_unit)
      });
      setMessage('Batch added successfully!');
      setFormData({
        product_id: '',
        batch_num: '',
        expiry_date: '',
        quantity: '',
        cost_per_unit: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error adding batch.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                Select Product
              </label>
              <select 
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                value={formData.product_id}
                onChange={e => setFormData({...formData, product_id: e.target.value})}
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                Batch Number
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. BATCH-2024-001"
                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                value={formData.batch_num}
                onChange={e => setFormData({...formData, batch_num: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Expiry Date
              </label>
              <input 
                required
                type="date"
                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                value={formData.expiry_date}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Quantity</label>
                <input 
                  required
                  type="number"
                  placeholder="0"
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Cost (Unit)
                </label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                  value={formData.cost_per_unit}
                  onChange={e => setFormData({...formData, cost_per_unit: e.target.value})}
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center text-sm font-medium ${message.includes('success') ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Add Batch to Inventory
            </button>
          </div>
        </form>
      </div>

      {/* Quick Links / Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-indigo-900 text-white rounded-xl shadow-lg">
          <h4 className="font-bold text-indigo-300 mb-2 uppercase text-xs tracking-wider">FEFO Rule Applied</h4>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "The system automatically sorts this new batch into the FEFO queue. Items expiring earlier will be flagged for priority sale."
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider text-indigo-600">Product Registration</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            If the product isn't in the list, please register it first in the product management section.
          </p>
        </div>
      </div>
    </div>
  );
}
