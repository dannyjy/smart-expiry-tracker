/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Batches from './components/Batches';
import Reports from './components/Reports';
import Products from './components/Products';
import Scanner from './components/Scanner';
import { inventoryService } from './services/api';
import { Alert } from './types';

type Tab = 'dashboard' | 'inventory' | 'batches' | 'reports' | 'products';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        await inventoryService.checkAlerts();
        const data = await inventoryService.getAlerts();
        setAlerts(data);
      } catch (e) {
        console.error("Failed to fetch alerts", e);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (id: number) => {
    await inventoryService.resolveAlert(id);
    const data = await inventoryService.getAlerts();
    setAlerts(data);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock Levels', icon: Package },
    { id: 'products', label: 'Product List', icon: Settings },
    { id: 'batches', label: 'Manage Batches', icon: Plus },
    { id: 'reports', label: 'Waste Analysis', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <div className="w-8 h-8 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-white text-lg tracking-tight">FEFO Tracker</h1>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">SME Smart System</p>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setShowScanner(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Scan to Add
          </button>
        </div>
        
        <div className="p-6 border-t border-slate-800 text-slate-500 text-[10px]">
          <p>ENGINE v1.0.4 - ACTIVE</p>
          <p>Last Sync: Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="lg:ml-64 bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="lg:hidden flex items-center gap-2">
          <Package className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-lg">SmartShelf</span>
        </div>
        <h1 className="hidden lg:block text-xl font-bold text-slate-800">
          {navItems.find(i => i.id === activeTab)?.label}
        </h1>
        <div className="ml-auto flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-1 transition-colors ${showNotifications ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <Bell className="w-6 h-6" />
            </button>
            {alerts.filter(a => a.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {alerts.filter(a => a.status === 'pending').length}
              </span>
            )}

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h4 className="font-bold text-slate-800 text-sm">System Alerts</h4>
                    {alerts.length > 0 && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">Live</span>}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map(alert => (
                        <div key={alert.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${alert.status === 'pending' ? 'bg-indigo-50/20' : ''}`}>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                Near Expiry: {alert.product_name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Expiry: {new Date(alert.expiry_date).toLocaleDateString()}
                              </p>
                              {alert.status === 'pending' && (
                                <button 
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="text-[10px] font-bold text-indigo-600 hover:underline"
                                >
                                  Mark as Reviewed
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-xs font-medium uppercase tracking-widest">No alerts active</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">Clear All History</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 pl-6 border-l border-slate-200 h-10 hover:opacity-80 transition-opacity"
            >
              <div className="text-right text-xs">
                <p className="font-semibold text-slate-900">Manager Alpha</p>
                <p className="text-slate-500">SME Admin</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                MA
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-2"
                >
                  <div className="p-4 bg-slate-900 rounded-xl mb-2 text-white">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="font-bold">danieljohn@sme.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Subscription Plan
                  </button>
                  <div className="border-t border-slate-100 my-2" />
                  <button className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 font-bold">
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'products' && <Products />}
            {activeTab === 'batches' && <Batches />}
            {activeTab === 'reports' && <Reports />}
          </motion.div>
        </AnimatePresence>

        {showScanner && (
          <Scanner 
            onScan={(text) => {
              console.log("Scanned:", text);
              // In real app, we would look up the product and maybe jump to Batches with prefilled data
              setShowScanner(false);
              setActiveTab('batches');
            }} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </main>
    </div>
  );
}

