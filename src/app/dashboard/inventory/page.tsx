'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Droplet, Plus, Minus, Save } from 'lucide-react';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('demo_hospital_id');
    if (id) {
      setHospitalId(id);
      fetchInventory(id);
    }
  }, []);

  const fetchInventory = async (hId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('hospital_blood_inventory')
      .select('*')
      .eq('hospital_id', hId)
      .order('blood_type');
    
    if (data) setInventory(data);
    setLoading(false);
  };

  const updateUnits = async (bloodType: string, change: number) => {
    const current = inventory.find(i => i.blood_type === bloodType);
    if (!current) return;
    
    const newUnits = Math.max(0, current.units + change);

    // Optimistic UI update
    setInventory(prev => prev.map(i => i.blood_type === bloodType ? { ...i, units: newUnits } : i));

    await supabase
      .from('hospital_blood_inventory')
      .update({ units: newUnits })
      .eq('hospital_id', hospitalId)
      .eq('blood_type', bloodType);
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><Droplet size={24} /> Blood Inventory Management</h2>
        <p>Real-time stock of blood units for your hospital.</p>
      </div>

      <div className={styles.grid}>
        {inventory.map(inv => (
          <div key={inv.blood_type} className={`${styles.card} ${inv.units < 5 ? styles.lowStock : ''}`}>
            <div className={styles.bloodType}>{inv.blood_type}</div>
            <div className={styles.unitsDisplay}>
              <span className={styles.unitsNumber}>{inv.units}</span>
              <span className={styles.unitsLabel}>Units</span>
            </div>
            
            <div className={styles.controls}>
              <button 
                className={styles.btn} 
                onClick={() => updateUnits(inv.blood_type, -1)}
                disabled={inv.units === 0}
              >
                <Minus size={18} />
              </button>
              <button 
                className={styles.btn} 
                onClick={() => updateUnits(inv.blood_type, 1)}
              >
                <Plus size={18} />
              </button>
            </div>
            
            {inv.units < 5 && (
              <div className={styles.warning}>Low Stock Warning</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
