
import { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  Trash2, 
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { inventoryService } from '../services/api';
import { Batch } from '../types';

export default function Reports() {
  const [deadCapital, setDeadCapital] = useState(0);
  const [expiredItems, setExpiredItems] = useState<Batch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const capital = await inventoryService.getDeadCapital();
      const inv = await inventoryService.getInventory();
      setDeadCapital(capital.dead_capital);
      setExpiredItems(inv.filter(b => new Date(b.expiry_date) < new Date()));
    };
    fetchData();
  }, []);

  const wasteData = [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 300 },
    { month: 'Mar', value: 600 },
    { month: 'Apr', value: deadCapital },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="hidden lg:block h-1 opacity-0 w-1" />
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-4 h-4 text-indigo-600" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Historical Waste Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-500">
              <TrendingDown className="text-indigo-500 w-4 h-4" />
              Dead Capital Analytics
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wasteData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 italic leading-relaxed text-center font-medium">
              Wastage peak identified in dairy category (April). FEFO adjustments suggested.
            </p>
          </div>

          {/* Expired Item List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-700">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800">Dead Capital Breakdown</h3>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold uppercase">Urgent</span>
            </div>
            <div className="overflow-x-auto">
              {expiredItems.length > 0 ? (
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Cost/Unit</th>
                      <th className="px-6 py-3 text-right">Total Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expiredItems.map((item) => (
                      <tr key={item.batch_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{item.product_name}</td>
                        <td className="px-6 py-4 text-slate-500">{item.quantity} units</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">${item.cost_per_unit.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600 font-mono">
                          ${(item.quantity * item.cost_per_unit).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Trash2 className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-xs font-semibold uppercase tracking-wider">No expired inventory detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <AlertTriangle className="text-indigo-200 w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-2">Resource Loss Alert</h4>
              <p className="text-indigo-200 text-xs mt-2 leading-relaxed opacity-80 italic">
                "You have ${deadCapital.toFixed(2)} tied up in expired stock. Consider liquidating near-expiry items immediately."
              </p>
              <button className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-950">
                Generate Disposal Plan
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-4 text-slate-800 text-sm uppercase tracking-widest text-indigo-600">
              SDG 12 Insight
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Efficiency Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">84</span>
                  <span className="text-sm text-slate-400 font-bold mb-1">/100</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                FEFO implementation results: 22% waste reduction this quarter. High alignment with Responsible Consumption goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
