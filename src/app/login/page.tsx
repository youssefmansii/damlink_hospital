'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('staff@kasralainy.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  
  const demoHospitals = [
    { id: '11111111-0000-0000-0000-000000000001', name: 'Kasr Al Ainy Hospital' },
    { id: '11111111-0000-0000-0000-000000000002', name: 'Nasser Institute Hospital' },
    { id: '11111111-0000-0000-0000-000000000003', name: 'Ain Shams Specialized Hospital' },
    { id: '11111111-0000-0000-0000-000000000004', name: 'Al-Maadi Military Hospital' },
    { id: '11111111-0000-0000-0000-000000000005', name: 'Cairo University Hospital' },
    { id: '11111111-0000-0000-0000-000000000006', name: 'Alexandria Medical Center' },
    { id: '11111111-0000-0000-0000-000000000007', name: 'Al Haram Hospital' }
  ];

  const [hospitals] = useState<any[]>(demoHospitals);
  const [selectedHospital, setSelectedHospital] = useState(demoHospitals[0].id);

  // Auto-login from query params (when coming from citizen-web role picker or scan result)
  useEffect(() => {
    const isAutoDemo = searchParams.get('demo');
    const autoEmail = searchParams.get('email');
    const targetHospId = searchParams.get('hospital_id');
    if (isAutoDemo === 'true' && autoEmail) {
      setEmail(autoEmail);
      autoLogin(autoEmail, targetHospId);
    }
  }, [searchParams]);

  const autoLogin = async (demoEmail: string, targetHospId?: string | null) => {
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'password123',
      });

      if (signInError) {
        // Try sign up if user doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: 'password123',
        });
        if (signUpError) {
          alert(`Auto-login failed: ${signUpError.message}`);
          setLoading(false);
          return;
        }
      }

      const matchHosp = demoHospitals.find(h => h.id === targetHospId) || demoHospitals[0];
      localStorage.setItem('demo_hospital_id', matchHosp.id);
      localStorage.setItem('demo_hospital_name', matchHosp.name);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDemo) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            alert(`Demo Sign Up Failed: ${signUpError.message}`);
            setLoading(false);
            return;
          }
        }
        
        localStorage.setItem('demo_hospital_id', selectedHospital);
        const hosp = hospitals.find(h => h.id === selectedHospital);
        if (hosp) localStorage.setItem('demo_hospital_name', hosp.name);
        
        router.push('/dashboard');
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert(error.message);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>DamLink</h2>
          <p>Hospital Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.toggleContainer}>
            <label>
              <input type="checkbox" checked={isDemo} onChange={(e) => setIsDemo(e.target.checked)} />
              Demo Mode (Auto-select hospital)
            </label>
          </div>

          {isDemo && (
            <div className={styles.inputGroup}>
              <label>Select Hospital</label>
              <select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} required>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
