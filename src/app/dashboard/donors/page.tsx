'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Star } from 'lucide-react';

export default function DonorsPage() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch donors registered at this hospital or in this region.
    // For demo purposes, we will fetch all donor_profiles that have a high reliability rating.
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('donor_profiles')
      .select(`*, profiles(full_name, blood_type, phone)`)
      .order('reliability_rating', { ascending: false })
      .limit(20);
    
    if (data) setDonors(data);
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading donors...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 600 }}>
          <Users size={24} /> Donor Registry
        </h2>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Directory of top-rated local blood donors.</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Name</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Blood Type</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Rating</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Donations</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Last Donation</th>
            </tr>
          </thead>
          <tbody>
            {donors.map(donor => (
              <tr key={donor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>
                  {donor.profiles?.full_name || 'Unknown'}
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{donor.profiles?.phone}</div>
                </td>
                <td style={{ padding: '16px', fontWeight: 700, color: '#dc2626' }}>
                  {donor.profiles?.blood_type}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} color="#eab308" fill="#eab308" /> {donor.reliability_rating}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {donor.donations_count}
                </td>
                <td style={{ padding: '16px', color: '#64748b' }}>
                  {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
            {donors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No donors found in registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
