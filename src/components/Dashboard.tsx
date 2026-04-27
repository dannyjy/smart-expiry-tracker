
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { inventoryService } from '../services/api';
import { Batch } from '../types';
import { format, isBefore, isAfter, addDays } from 'date-fns';

export default function Dashboard() {
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [deadCapital, setDeadCapital] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const inv = await inventoryService.getInventory();
      const dc = await inventoryService.getDeadCapital();
      setInventory(inv);
      setDeadCapital(dc.dead_capital);
    };
    loadData();
  }, []);

  const now = new Date();
  const nearExpiryThreshold = addDays(now, 30);

  const stats = {
    total: inventory.reduce((acc, curr) => acc + curr.quantity, 0),
    nearExpiry: inventory.filter(b => {
      const exp = new Date(b.expiry_date);
      return isAfter(exp, now) && isBefore(exp, nearExpiryThreshold);
    }).length,
    expired: inventory.filter(b => isBefore(new Date(b.expiry_date), now)).length,
  };

  const chartData = [
    { name: 'Healthy', value: Math.max(0, inventory.length - stats.nearExpiry - stats.expired), color: '#6366f1' },
    { name: 'Near Expiry', value: stats.nearExpiry, color: '#f59e0b' },
    { name: 'Expired', value: stats.expired, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Stocked Items', value: stats.total, icon: TrendingUp, color: 'indigo', trend: '+4% from last week', trendColor: 'green' },
          { label: 'Near Expiry (30d)', value: stats.nearExpiry, icon: Clock, color: 'amber', trend: 'Threshold Active', trendColor: 'slate' },
          { label: 'Expired Count', value: stats.expired, icon: AlertCircle, color: 'rose', trend: 'Action Required', trendColor: 'rose' },
          { label: 'Dead Capital', value: `$${deadCapital.toFixed(2)}`, icon: DollarSign, color: 'slate', trend: 'Lost Potential Revenue', trendColor: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-500 text-xs font-semibold uppercase mb-1 tracking-wider">{stat.label}</p>
            <h3 className={`text-2xl font-bold ${stat.label === 'Expired Count' ? 'text-rose-600' : stat.label === 'Near Expiry (30d)' ? 'text-amber-600' : 'text-slate-900'} mt-1`}>
              {stat.value}
            </h3>
            <p className={`text-${stat.trendColor}-500 text-[10px] mt-2 font-semibold uppercase tracking-tight`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Expiry Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="font-bold text-slate-800">Priority Expiry Feed (FEFO)</h2>
            <button className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold">Product Name</th>
                  <th className="px-6 py-3 font-semibold">Batch #</th>
                  <th className="px-6 py-3 font-semibold">Expiry Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-slate-50">
                {inventory.slice(0, 6).map((batch) => {
                  const expDate = new Date(batch.expiry_date);
                  const isExpired = isBefore(expDate, now);
                  const isNear = isAfter(expDate, now) && isBefore(expDate, nearExpiryThreshold);
                  
                  return (
                    <tr key={batch.batch_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{batch.product_name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{batch.batch_num}</td>
                      <td className="px-6 py-4 text-slate-600">{format(expDate, 'yyyy-MM-dd')}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${
                          isExpired ? 'bg-rose-100 text-rose-700' : 
                          isNear ? 'bg-amber-100 text-amber-700' : 
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {isExpired ? 'Expired' : isNear ? `${Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24))} Days Left` : 'Safe'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Alert Engine Log
            </h3>
            <div className="space-y-4">
              <div className="border-l-2 border-indigo-500 pl-4 py-1">
                <p className="text-xs font-bold">Daily Sweep Completed</p>
                <p className="text-[10px] text-slate-400 mt-1">System scanned {inventory.length} active batches.</p>
              </div>
              <div className="border-l-2 border-indigo-500/30 pl-4 py-1">
                <p className="text-xs font-bold text-slate-300">FEFO Logic Active</p>
                <p className="text-[10px] text-slate-500 mt-1">Inventory sorted by closest expiry date.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4">Wastage Distribution</h3>
            <div className="flex-1 flex flex-col justify-center items-center min-h-[200px]">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full mt-4 space-y-2">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-500 italic leading-relaxed text-center px-2">
              FEFO adjustments suggested to reduce dairy waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
