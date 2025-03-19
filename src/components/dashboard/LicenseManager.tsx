import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LicenseService } from '@/lib/licenseService';
import { supabase } from '@/lib/supabase';
import type { License, DeviceRegistration } from '@/types/license';
import { CopyIcon, CheckIcon } from 'lucide-react';

export default function LicenseManager() {
  const [license, setLicense] = useState<License | null>(null);
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadLicenseData();
  }, []);

  const loadLicenseData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: licenses, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (licenseError && licenseError.code !== 'PGRST116') throw licenseError;
      setLicense(licenses || null);

      if (licenses) {
        const { data: deviceData, error: deviceError } = await supabase
          .from('device_registrations')
          .select('*')
          .eq('license_id', licenses.id);

        if (deviceError) throw deviceError;
        setDevices(deviceData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewLicense = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const newLicense = await LicenseService.generateLicense(user.id, expiryDate);
      if (newLicense) {
        setLicense(newLicense);
        setDevices([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const copyLicenseKey = () => {
    if (!license) return;
    
    navigator.clipboard.writeText(license.license_key)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        setError('Failed to copy license key');
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">License Management</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!license ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active License</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Generate a unique license key to activate the extension.</p>
            <Button onClick={generateNewLicense}>Generate License</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">License Key:</p>
                  <code className="bg-muted px-2 py-1 rounded">{license.license_key}</code>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyLicenseKey}
                    className="ml-2"
                  >
                    {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
                <p><strong>Status:</strong> {license.status}</p>
                <p><strong>Expires:</strong> {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</p>
                <p><strong>Devices:</strong> {devices.length} / {license.max_devices}</p>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">How to use your license key:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Install the SupplyChainHub browser extension</li>
                    <li>Click on the extension icon in your browser toolbar</li>
                    <li>Enter your unique license key in the activation field</li>
                    <li>Click "Activate" to enable the extension</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <p>No devices registered</p>
              ) : (
                <ul className="space-y-2">
                  {devices.map(device => (
                    <li key={device.id} className="p-2 border rounded">
                      <p><strong>Device ID:</strong> {device.device_fingerprint.substring(0, 8)}...</p>
                      <p><strong>Last Verified:</strong> {new Date(device.last_verified_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
