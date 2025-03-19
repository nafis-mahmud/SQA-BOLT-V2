import { useEffect, useState } from 'react';
import { getAuthToken, verifyAuthToken } from '@/lib/authToken';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClipboardCopyIcon, CheckIcon, InfoCircledIcon } from '@radix-ui/react-icons';

/**
 * TokenDisplayPage component
 * 
 * This page displays the user's authentication token and provides instructions
 * for using it with the SupplyChainHub Chrome extension.
 */
export default function TokenDisplayPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the token from localStorage
    const authToken = getAuthToken();
    setToken(authToken);

    // If we have a token, try to decode it
    if (authToken) {
      try {
        const { valid, data, error: verifyError } = verifyAuthToken(authToken);
        if (valid && data) {
          setTokenInfo(data);
        } else {
          setError(verifyError || 'Invalid token');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Could not decode token');
      }
    } else {
      setError('No authentication token found. Please log in first.');
    }
  }, []);

  // Function to copy token to clipboard
  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => {
          setCopied(true);
          // Reset copied state after 3 seconds
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          setError('Failed to copy token to clipboard');
        });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Extension Token</h1>
      
      <div className="grid gap-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Your Authentication Token</CardTitle>
            <CardDescription>
              Use this token to authenticate the SupplyChainHub Chrome extension
            </CardDescription>
          </CardHeader>
          <CardContent>
            {token ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md overflow-x-auto">
                  <code className="text-sm break-all">{token}</code>
                </div>
                
                {tokenInfo && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Token Information:</h4>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>User ID:</strong> {tokenInfo.userId}</p>
                      <p><strong>Email:</strong> {tokenInfo.email}</p>
                      <p><strong>Role:</strong> {tokenInfo.role}</p>
                      {tokenInfo.exp && (
                        <p>
                          <strong>Expires:</strong>{' '}
                          {new Date(tokenInfo.exp * 1000).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading token...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={copyToClipboard} 
              disabled={!token || copied}
              className="w-full"
            >
              {copied ? (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardCopyIcon className="mr-2 h-4 w-4" />
                  Copy Token
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Use This Token</CardTitle>
            <CardDescription>
              Follow these steps to authenticate your Chrome extension
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <InfoCircledIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  This token contains your authentication credentials. Do not share it with anyone.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h3 className="font-medium">Steps to authenticate your extension:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Copy the token above using the "Copy Token" button</li>
                  <li>Open the SupplyChainHub Chrome extension</li>
                  <li>Paste the token into the token input field</li>
                  <li>Click "Submit Token"</li>
                  <li>The extension will now be able to access your projects and files</li>
                </ol>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Troubleshooting:</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>If you get a "No token available" error, try copying the token again</li>
                  <li>If your token has expired, log out and log back in to generate a new one</li>
                  <li>Make sure you've installed the latest version of the extension</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
