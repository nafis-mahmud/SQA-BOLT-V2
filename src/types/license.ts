export interface License {
  id: string;
  license_key: string;
  user_id: string;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  expires_at: string | null;
  max_devices: number;
  metadata: Record<string, any>;
}

export interface DeviceRegistration {
  id: string;
  license_id: string;
  device_fingerprint: string;
  ip_address: string | null;
  last_verified_at: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface LicenseAuditLog {
  id: string;
  license_id: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
}
