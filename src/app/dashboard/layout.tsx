'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, ClipboardList, Droplet, Users, MessageSquare, HelpCircle, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hospitalName, setHospitalName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      }
    });

    const name = localStorage.getItem('demo_hospital_name');
    if (name) setHospitalName(name);
  }, [router]);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Inventory', icon: Droplet, path: '/dashboard/inventory' },
    { name: 'Requests', icon: ClipboardList, path: '/dashboard/requests' },
    { name: 'Donors', icon: Users, path: '/dashboard/donors' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}><Droplet size={20} color="white" /></div>
          <span className={styles.logoText}>Damlink</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.notification}>
            <Bell size={20} />
            <span className={styles.badge}>3</span>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}><User size={16} /></div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Arjun Verma</span>
              <span className={styles.userRole}>{hospitalName || 'City Hospital'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navItems.map(item => (
              <Link 
                key={item.name} 
                href={item.path}
                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
              >
                <item.icon size={20} className={pathname === item.path ? styles.activeIcon : styles.icon} />
                <span className={styles.navText}>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className={styles.sidebarFooter}>
            <Link href="/help" className={styles.navItem}>
              <HelpCircle size={20} className={styles.icon} />
              <span className={styles.navText}>Help & Support</span>
            </Link>
          </div>
        </aside>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
