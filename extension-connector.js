/**
 * Extension Connector Script
 * 
 * This script helps your web application communicate with the Chrome extension.
 * Add this to your web application and call the sendTokenToExtension function
 * after a successful login.
 */

// Extension ID - You need to replace this with your actual extension ID
// You can find your extension ID in chrome://extensions when in developer mode
const EXTENSION_ID = "YOUR_EXTENSION_ID_HERE";

/**
 * Send the authentication token to the Chrome extension
 * @param {string} token - The authentication token
 * @returns {Promise} - Promise that resolves with the extension's response
 */
function sendTokenToExtension(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error("No token provided"));
      return;
    }
    
    try {
      // Try to send message to the extension
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "setAuthToken", token: token },
        function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending token to extension:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success) {
            console.log("Token successfully sent to extension");
            resolve(response);
          } else {
            const error = (response && response.error) ? response.error : "Unknown error";
            console.error("Failed to send token to extension:", error);
            reject(new Error(error));
          }
        }
      );
    } catch (error) {
      console.error("Exception when sending token to extension:", error);
      reject(error);
    }
  });
}

/**
 * Check if the extension is installed
 * @returns {Promise<boolean>} - Promise that resolves with whether the extension is installed
 */
function isExtensionInstalled() {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "ping" },
        function(response) {
          if (chrome.runtime.lastError) {
            // Extension is not installed or not accessible
            resolve(false);
            return;
          }
          // Extension is installed and responded
          resolve(true);
        }
      );
    } catch (error) {
      // Error occurred, extension is likely not installed
      resolve(false);
    }
  });
}

// Example usage in your web application:
/*
document.addEventListener('DOMContentLoaded', function() {
  // Check if extension is installed
  isExtensionInstalled().then(installed => {
    if (installed) {
      console.log("SupplyChainHub extension is installed!");
      
      // If you have the token available, you can send it right away
      const token = localStorage.getItem('authToken');
      if (token) {
        sendTokenToExtension(token)
          .then(response => {
            console.log("Extension authenticated:", response);
          })
          .catch(error => {
            console.error("Failed to authenticate extension:", error);
          });
      }
    } else {
      console.log("SupplyChainHub extension is not installed.");
      // Maybe show a message to the user suggesting they install the extension
    }
  });
});

// After login success, send the token to the extension
function afterLoginSuccess(token) {
  // Save token to localStorage for your web app
  localStorage.setItem('authToken', token);
  
  // Send to extension if installed
  sendTokenToExtension(token)
    .then(response => {
      console.log("Extension authenticated:", response);
    })
    .catch(error => {
      console.error("Failed to authenticate extension:", error);
    });
}
*/
