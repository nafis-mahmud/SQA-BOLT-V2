import { LicenseService } from '@/lib/licenseService';

export async function verifyLicense(req: Request): Promise<Response> {
  try {
    // Parse request body
    const body = await req.json();
    const { licenseKey, deviceFingerprint } = body;

    if (!licenseKey || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'License key and device fingerprint are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate license
    const result = await LicenseService.validateLicense(licenseKey, deviceFingerprint);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.valid ? 200 : 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('License verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export default { verifyLicense };
