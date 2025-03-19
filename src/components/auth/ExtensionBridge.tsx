import { useEffect } from 'react';
import { getAuthToken } from '@/lib/authToken';

/**
 * This component serves as a bridge between the web application and the extension.
 * It listens for messages from the extension's content script and responds with the auth token.
 */
export default function ExtensionBridge() {
  useEffect(() => {
    // Function to handle messages from the extension
    const handleExtensionMessages = (event: MessageEvent) => {
      // Only accept messages from our extension
      if (event.source !== window) return;
      
      // Check if the message is requesting the auth token
      if (event.data && event.data.type === 'FROM_EXTENSION' && event.data.action === 'getAuthToken') {
        console.log('Extension requested auth token');
        
        // Get the token from localStorage
        const token = getAuthToken();
        
        // Send the token back to the extension
        window.postMessage(
          { 
            type: 'FROM_WEBAPP', 
            action: 'authTokenResponse', 
            token: token 
          }, 
          '*'
        );
      }
    };

    // Add event listener for messages
    window.addEventListener('message', handleExtensionMessages);
    
    // Add a custom event that will be triggered when the user logs in
    const handleAuthChange = () => {
      const token = getAuthToken();
      if (token) {
        console.log('Auth token changed, notifying extension');
        window.postMessage(
          { 
            type: 'FROM_WEBAPP', 
            action: 'authTokenChanged', 
            token: token 
          }, 
          '*'
        );
      }
    };

    // Create a MutationObserver to detect when the user navigates to the dashboard
    // This is a way to detect successful login
    const observer = new MutationObserver((mutations) => {
      if (window.location.pathname.includes('/dashboard')) {
        handleAuthChange();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document, { subtree: true, childList: true });

    // Clean up
    return () => {
      window.removeEventListener('message', handleExtensionMessages);
      observer.disconnect();
    };
  }, []);

  // This component doesn't render anything
  return null;
}
