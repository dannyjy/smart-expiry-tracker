
import { Product, Batch, Alert } from '../types';

const API_BASE = '/api';

export const inventoryService = {
  async getInventory(): Promise<Batch[]> {
    const res = await fetch(`${API_BASE}/inventory`);
    return res.json();
  },

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  async addProduct(data: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addBatch(data: Partial<Batch> & { product_id: number }) {
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async checkAlerts() {
    const res = await fetch(`${API_BASE}/alerts/check`);
    return res.json();
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    return res.json();
  },

  async resolveAlert(id: number) {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'POST'
    });
    return res.json();
  },

  async getDeadCapital(): Promise<{ dead_capital: number }> {
    const res = await fetch(`${API_BASE}/reports/dead-capital`);
    return res.json();
  }
};
