import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeDashboard(hospitalId: string | null) {
  const [requests, setRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!hospitalId) return;

    // Initial Fetch
    const fetchData = async () => {
      // 1. Fetch active requests for this hospital
      const { data: reqData } = await supabase
        .from('emergency_requests')
        .select(`
          *,
          patients (
            full_name,
            dob,
            photo_url,
            medical_conditions,
            blood_type
          )
        `)
        .eq('assigned_hospital_id', hospitalId)
        .neq('status', 'resolved')
        .neq('status', 'expired')
        .order('created_at', { ascending: false });
      
      if (reqData) setRequests(reqData);

      // 2. Fetch inventory
      const { data: invData } = await supabase
        .from('hospital_blood_inventory')
        .select('*')
        .eq('hospital_id', hospitalId);
      
      if (invData) setInventory(invData);

      // 3. Fetch active dispatches for requests assigned to this hospital
      // This is slightly complex in a single query from dispatches, so we fetch dispatches where request is active
      const requestIds = reqData?.map(r => r.id) || [];
      if (requestIds.length > 0) {
        const { data: dispData } = await supabase
          .from('donor_dispatches')
          .select(`
            *,
            profiles(full_name, phone, blood_type),
            donor_profiles(location, reliability_rating, donations_count)
          `)
          .in('request_id', requestIds)
          .neq('status', 'completed')
          .neq('status', 'no_show');
        if (dispData) setDispatches(dispData);
      }
    };

    fetchData();

    // Realtime Subscriptions
    const reqSub = supabase.channel('requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_requests', filter: `assigned_hospital_id=eq.${hospitalId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new, ...prev]);
            // Notice: payload.new doesn't include joined relations (patients), 
            // in a full app we'd fetch the patient details for this specific request here.
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const invSub = supabase.channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospital_blood_inventory', filter: `hospital_id=eq.${hospitalId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setInventory(prev => {
              const exists = prev.find(i => i.blood_type === payload.new.blood_type);
              if (exists) return prev.map(i => i.blood_type === payload.new.blood_type ? payload.new : i);
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();
      
    // Dispatches realtime is harder to filter strictly by hospital_id since it's on request_id
    const dispSub = supabase.channel('dispatches_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donor_dispatches' },
        (payload) => {
          // If we receive a dispatch change, just re-fetch dispatches to ensure joins are correct
          // In production, we'd only refetch if the request_id is in our list
          if (payload.new && 'request_id' in payload.new) {
             setDispatches(prev => {
                 const newDisp = prev.find(d => d.id === payload.new.id);
                 if (newDisp) {
                     return prev.map(d => d.id === payload.new.id ? { ...d, ...payload.new } : d);
                 }
                 return prev; // Or trigger fetch
             });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reqSub);
      supabase.removeChannel(invSub);
      supabase.removeChannel(dispSub);
    };
  }, [hospitalId]);

  return { requests, inventory, dispatches, isConnected };
}
