import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { LicenseService } from '@/lib/licenseService';
import { supabase } from '@/lib/supabase';
import type { License, DeviceRegistration } from '@/types/license';
import { CopyIcon, CheckIcon } from 'lucide-react';

export default function AdminLicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadLicenses();
  }, []);

  useEffect(() => {
    if (selectedLicense) {
      loadDevices(selectedLicense.id);
    }
  }, [selectedLicense]);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const { data, error: licenseError } = await supabase
        .from('licenses')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `);

      if (licenseError) throw licenseError;
      setLicenses(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async (licenseId: string) => {
    try {
      const { data, error } = await supabase
        .from('device_registrations')
        .select('*')
        .eq('license_id', licenseId);

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Error loading devices:', err);
      setDevices([]);
    }
  };

  const updateLicenseStatus = async (licenseId: string, status: 'active' | 'expired' | 'revoked') => {
    try {
      const success = await LicenseService.updateLicenseStatus(licenseId, status);
      if (success) {
        setLicenses(licenses.map(license => 
          license.id === licenseId ? { ...license, status } : license
        ));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const success = await LicenseService.revokeDevice(deviceId);
      if (success && selectedLicense) {
        setDevices(devices.filter(device => device.id !== deviceId));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const generateLicense = async () => {
    try {
      setIsGenerating(true);
      
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (userError) {
        throw new Error(`User with email ${userEmail} not found`);
      }
      
      // Calculate expiration date
      let expiryDate: Date | undefined;
      if (expirationDate) {
        expiryDate = new Date(expirationDate);
      }
      
      // Generate license
      const newLicense = await LicenseService.generateLicense(userData.id, expiryDate);
      
      if (newLicense) {
        setLicenses([...licenses, newLicense]);
        setIsGenerateDialogOpen(false);
        setUserEmail('');
        setExpirationDate('');
      } else {
        throw new Error('Failed to generate license');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLicenseKey = (licenseKey: string) => {
    navigator.clipboard.writeText(licenseKey)
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
      <h2 className="text-2xl font-bold">License Administration</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl">All Licenses</h3>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Generate New License</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate License</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="userEmail" className="text-sm font-medium">User Email</label>
                <Input 
                  id="userEmail"
                  type="email" 
                  placeholder="user@example.com" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="expirationDate" className="text-sm font-medium">Expiration Date</label>
                <Input 
                  id="expirationDate"
                  type="date" 
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={generateLicense} 
                disabled={isGenerating || !userEmail}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Key</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No licenses found</TableCell>
            </TableRow>
          ) : (
            licenses.map(license => (
              <TableRow key={license.id}>
                <TableCell className="font-mono text-sm">
                  {license.license_key.substring(0, 10)}...
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyLicenseKey(license.license_key)}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>{license.profiles?.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    license.status === 'active' ? 'bg-green-100 text-green-800' : 
                    license.status === 'expired' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {license.status}
                  </span>
                </TableCell>
                <TableCell>
                  {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLicense(license)}
                    >
                      Details
                    </Button>
                    {license.status === 'active' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateLicenseStatus(license.id, 'revoked')}
                      >
                        Revoke
                      </Button>
                    ) : license.status === 'revoked' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLicenseStatus(license.id, 'active')}
                      >
                        Reactivate
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedLicense && (
        <Dialog open={!!selectedLicense} onOpenChange={(open) => !open && setSelectedLicense(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>License Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">License Information</h4>
                  <div className="space-y-2">
                    <p><strong>License Key:</strong> {selectedLicense.license_key}</p>
                    <p><strong>Status:</strong> {selectedLicense.status}</p>
                    <p><strong>Created:</strong> {new Date(selectedLicense.created_at).toLocaleString()}</p>
                    <p><strong>Expires:</strong> {selectedLicense.expires_at ? new Date(selectedLicense.expires_at).toLocaleDateString() : 'Never'}</p>
                    <p><strong>Max Devices:</strong> {selectedLicense.max_devices}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Registered Devices ({devices.length}/{selectedLicense.max_devices})</h4>
                  {devices.length === 0 ? (
                    <p>No devices registered</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {devices.map(device => (
                        <div key={device.id} className="p-2 border rounded flex justify-between items-center">
                          <div>
                            <p className="text-sm"><strong>ID:</strong> {device.device_fingerprint.substring(0, 8)}...</p>
                            <p className="text-xs text-muted-foreground">Last active: {new Date(device.last_verified_at).toLocaleString()}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => revokeDevice(device.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
