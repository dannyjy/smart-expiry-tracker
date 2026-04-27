
import { useState, useEffect } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import { inventoryService } from '../services/api';
import { Batch } from '../types';
import { format, isBefore, isAfter, addDays } from 'date-fns';

export default function Inventory() {
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    inventoryService.getInventory().then(setInventory);
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_num.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();
  const nearExpiryThreshold = addDays(now, 30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products or batches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64 md:w-80 text-sm"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Batch #</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredInventory.map((item) => {
                const expDate = new Date(item.expiry_date);
                const isExpired = isBefore(expDate, now);
                const isNear = isAfter(expDate, now) && isBefore(expDate, nearExpiryThreshold);

                return (
                  <tr key={item.batch_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-[10px] font-mono text-slate-500">{item.batch_num}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[11px] font-bold uppercase tracking-tighter ${
                          isExpired ? 'text-rose-600' : isNear ? 'text-amber-600' : 'text-indigo-600'
                        }`}>
                          {isExpired ? 'Expired' : isNear ? 'Expiring Soon' : 'Healthy'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(expDate, 'yyyy-MM-dd')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${item.quantity < 10 ? 'text-rose-500' : 'text-slate-900'}`}>
                        {item.quantity} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                      ${(item.quantity * item.cost_per_unit).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
