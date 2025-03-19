import { supabase } from './supabase';
import type { License, DeviceRegistration } from '@/types/license';

export class LicenseService {
  /**
   * Generate a new license for a user
   */
  static async generateLicense(userId: string, expiresAt?: Date): Promise<License | null> {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .insert([
          {
            user_id: userId,
            expires_at: expiresAt?.toISOString(),
            license_key: await this.generateLicenseKey()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating license:', error);
      return null;
    }
  }

  /**
   * Validate a license key
   */
  static async validateLicense(licenseKey: string, deviceFingerprint: string): Promise<{
    valid: boolean;
    message?: string;
    licenseData?: Partial<License>;
  }> {
    try {
      // Get license details
      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .single();

      if (licenseError || !license) {
        return { valid: false, message: 'Invalid license key' };
      }

      // Check if license is active
      if (license.status !== 'active') {
        return { valid: false, message: `License is ${license.status}` };
      }

      // Check expiration
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        await this.updateLicenseStatus(license.id, 'expired');
        return { valid: false, message: 'License has expired' };
      }

      // Check device count
      const { count } = await supabase
        .from('device_registrations')
        .select('*', { count: 'exact' })
        .eq('license_id', license.id);

      // Check if this device is already registered
      const { data: existingDevice } = await supabase
        .from('device_registrations')
        .select('*')
        .eq('license_id', license.id)
        .eq('device_fingerprint', deviceFingerprint)
        .single();

      if (!existingDevice && count >= license.max_devices) {
        return { 
          valid: false, 
          message: `Maximum number of devices (${license.max_devices}) reached` 
        };
      }

      // Register device if not already registered
      if (!existingDevice) {
        const { error: deviceError } = await supabase
          .from('device_registrations')
          .insert({
            license_id: license.id,
            device_fingerprint: deviceFingerprint,
            ip_address: await this.getClientIP(),
            last_verified_at: new Date().toISOString()
          });

        if (deviceError) throw deviceError;
      } else {
        // Update last verified timestamp
        await supabase
          .from('device_registrations')
          .update({ last_verified_at: new Date().toISOString() })
          .eq('id', existingDevice.id);
      }

      // Log the validation in audit log
      await this.logLicenseEvent(license.id, 'validation', {
        device_fingerprint: deviceFingerprint,
        ip_address: await this.getClientIP()
      });

      return { 
        valid: true,
        licenseData: {
          expires_at: license.expires_at,
          status: license.status,
          max_devices: license.max_devices
        }
      };
    } catch (error) {
      console.error('Error validating license:', error);
      return { valid: false, message: 'Error validating license' };
    }
  }

  /**
   * Update license status
   */
  static async updateLicenseStatus(licenseId: string, status: 'active' | 'expired' | 'revoked'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('licenses')
        .update({ status })
        .eq('id', licenseId);

      if (error) throw error;
      
      // Log the status change
      await this.logLicenseEvent(licenseId, 'status_change', { new_status: status });
      
      return true;
    } catch (error) {
      console.error('Error updating license status:', error);
      return false;
    }
  }

  /**
   * Revoke a device registration
   */
  static async revokeDevice(deviceId: string): Promise<boolean> {
    try {
      const { data: device, error: fetchError } = await supabase
        .from('device_registrations')
        .select('license_id')
        .eq('id', deviceId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('device_registrations')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;
      
      // Log the device revocation
      await this.logLicenseEvent(device.license_id, 'device_revoked', { device_id: deviceId });
      
      return true;
    } catch (error) {
      console.error('Error revoking device:', error);
      return false;
    }
  }

  /**
   * Log license events to audit log
   */
  private static async logLicenseEvent(
    licenseId: string, 
    eventType: string, 
    details: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('license_audit_logs')
        .insert({
          license_id: licenseId,
          event_type: eventType,
          details
        });
    } catch (error) {
      console.error('Error logging license event:', error);
    }
  }

  /**
   * Get client IP address
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return '';
    }
  }

  /**
   * Generate a unique license key
   */
  private static async generateLicenseKey(): Promise<string> {
    const { data, error } = await supabase
      .rpc('generate_license_key');

    if (error) throw error;
    return data;
  }
}
