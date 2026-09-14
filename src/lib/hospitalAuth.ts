import { supabase } from './supabase';

export interface HospitalContext {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  staff: {
    id: string;
    role: string | null;
    hospital_id: string;
  };
  hospital: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    location?: unknown;
  };
}

export async function getHospitalContext(): Promise<HospitalContext | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('hospital_staff')
    .select(
      `
        id,
        role,
        hospital_id,
        hospitals (
          id,
          name,
          address,
          phone,
          location
        )
      `
    )
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data?.hospitals) return null;

  const hospital = Array.isArray(data.hospitals) ? data.hospitals[0] : data.hospitals;
  if (!hospital) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
    staff: {
      id: data.id,
      role: data.role,
      hospital_id: data.hospital_id,
    },
    hospital,
  };
}
