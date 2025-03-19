// License validation interval (12 hours)
const VALIDATION_INTERVAL = 12 * 60 * 60 * 1000;
const GRACE_PERIOD = 72 * 60 * 60 * 1000;
let validationAttempts = 0;
const MAX_VALIDATION_ATTEMPTS = 3;

// Recording state
let isRecording = false;
let recordingTabId = null;
let recordingData = [];

// API endpoint for license validation
const API_ENDPOINT = 'https://app.supplychainhub.com/api/license/validate';

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isActivated: false,
    lastValidation: null,
    licenseKey: null,
    deviceId: generateDeviceId()
  });
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ACTIVATE_LICENSE') {
    activateLicense(message.licenseKey).then(sendResponse);
    return true;
  }
  if (message.type === 'CHECK_LICENSE') {
    checkLicenseStatus().then(sendResponse);
    return true;
  }
  if (message.type === 'GET_STATUS') {
    getLicenseStatus().then(sendResponse);
    return true;
  }
  if (message.type === 'START_RECORDING') {
    startRecording(sender.tab?.id).then(sendResponse);
    return true;
  }
  if (message.type === 'STOP_RECORDING') {
    stopRecording().then(sendResponse);
    return true;
  }
  if (message.type === 'RESET_RECORDING') {
    resetRecording().then(sendResponse);
    return true;
  }
  if (message.type === 'VERIFY_TOKEN') {
    verifyToken(message.token).then(sendResponse);
    return true;
  }
});

function generateDeviceId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function activateLicense(licenseKey) {
  try {
    const { deviceId } = await chrome.storage.local.get('deviceId');
    
    // For development/testing, use a mock response
    // In production, uncomment the fetch call to validate with your backend
    
    /* 
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licenseKey,
        deviceFingerprint: deviceId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'License activation failed');
    }
    
    const data = await response.json();
    */
    
    // Mock response for development
    // In production, replace this with the actual API call above
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate validation logic
    if (licenseKey.length < 10) {
      return { success: false, error: 'Invalid license key format' };
    }
    
    const mockResponse = {
      valid: true,
      licenseData: {
        expires_at: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'active',
        max_devices: 3
      }
    };
    
    if (!mockResponse.valid) {
      return { success: false, error: mockResponse.message || 'License validation failed' };
    }

    await chrome.storage.local.set({
      isActivated: true,
      licenseKey,
      lastValidation: Date.now(),
      expiresAt: mockResponse.licenseData.expires_at,
      licenseStatus: mockResponse.licenseData.status,
      maxDevices: mockResponse.licenseData.max_devices
    });

    scheduleNextValidation();
    return { success: true };
  } catch (error) {
    console.error('License activation failed:', error);
    return { success: false, error: error.message };
  }
}

async function checkLicenseStatus() {
  const {
    isActivated,
    licenseKey,
    lastValidation,
    expiresAt,
    licenseStatus
  } = await chrome.storage.local.get([
    'isActivated',
    'licenseKey',
    'lastValidation',
    'expiresAt',
    'licenseStatus'
  ]);

  if (!isActivated || !licenseKey) {
    return { valid: false, reason: 'not_activated' };
  }

  if (licenseStatus !== 'active') {
    return { valid: false, reason: 'license_' + licenseStatus };
  }

  if (expiresAt && Date.now() > new Date(expiresAt).getTime()) {
    return { valid: false, reason: 'expired' };
  }

  const timeSinceLastValidation = Date.now() - lastValidation;
  if (timeSinceLastValidation > GRACE_PERIOD) {
    return { valid: false, reason: 'grace_period_expired' };
  }

  return { valid: true };
}

async function getLicenseStatus() {
  try {
    const data = await chrome.storage.local.get([
      'isActivated',
      'licenseKey',
      'lastValidation',
      'expiresAt',
      'licenseStatus',
      'maxDevices'
    ]);

    return {
      isActivated: data.isActivated || false,
      licenseKey: data.licenseKey || null,
      lastValidation: data.lastValidation || null,
      expiresAt: data.expiresAt || null,
      licenseStatus: data.licenseStatus || null,
      maxDevices: data.maxDevices || 3
    };
  } catch (error) {
    console.error('Error getting license status:', error);
    return {
      isActivated: false,
      licenseKey: null,
      lastValidation: null,
      expiresAt: null,
      licenseStatus: null,
      maxDevices: 3
    };
  }
}

function scheduleNextValidation() {
  chrome.alarms.create('validateLicense', {
    delayInMinutes: VALIDATION_INTERVAL / (60 * 1000),
    periodInMinutes: VALIDATION_INTERVAL / (60 * 1000)
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'validateLicense') {
    validateLicense();
  }
});

async function validateLicense() {
  try {
    const { licenseKey, deviceId } = await chrome.storage.local.get(['licenseKey', 'deviceId']);
    
    if (!licenseKey) {
      throw new Error('No license key found');
    }
    
    // In production, uncomment this to validate with your backend
    /*
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licenseKey,
        deviceFingerprint: deviceId
      })
    });
    
    if (!response.ok) {
      throw new Error('License validation failed');
    }
    
    const data = await response.json();
    
    if (!data.valid) {
      throw new Error(data.message || 'License is no longer valid');
    }
    
    await chrome.storage.local.set({
      lastValidation: Date.now(),
      expiresAt: data.licenseData.expires_at,
      licenseStatus: data.licenseData.status,
      maxDevices: data.licenseData.max_devices
    });
    */
    
    // Mock validation for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    validationAttempts = 0;
    await chrome.storage.local.set({
      lastValidation: Date.now()
    });
    
    console.log('License validated successfully');
  } catch (error) {
    console.error('License validation failed:', error);
    validationAttempts++;
    
    if (validationAttempts >= MAX_VALIDATION_ATTEMPTS) {
      console.error('Max validation attempts reached, deactivating license');
      await chrome.storage.local.set({
        isActivated: false,
        licenseStatus: 'revoked'
      });
    }
  }
}

// Recording functions
async function startRecording(tabId) {
  try {
    // Check if license is valid before starting recording
    const licenseStatus = await checkLicenseStatus();
    if (!licenseStatus.valid) {
      return { success: false, error: `License is not valid: ${licenseStatus.reason}` };
    }

    if (isRecording) {
      return { success: false, error: 'Already recording' };
    }

    isRecording = true;
    recordingTabId = tabId || null;
    recordingData = [];
    
    // Get current tab if tabId is not provided
    if (!recordingTabId) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        recordingTabId = tabs[0].id;
      }
    }

    // Notify content script to start recording
    if (recordingTabId) {
      try {
        await chrome.tabs.sendMessage(recordingTabId, { 
          type: 'START_RECORDING_ON_PAGE' 
        });
      } catch (error) {
        console.error('Error sending message to content script:', error);
      }
    }

    console.log('Recording started on tab:', recordingTabId);
    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    return { success: false, error: error.message };
  }
}

async function stopRecording() {
  try {
    if (!isRecording) {
      return { success: false, error: 'Not recording' };
    }

    isRecording = false;
    
    // Notify content script to stop recording
    if (recordingTabId) {
      try {
        await chrome.tabs.sendMessage(recordingTabId, { 
          type: 'STOP_RECORDING_ON_PAGE' 
        });
      } catch (error) {
        console.error('Error sending message to content script:', error);
      }
    }

    console.log('Recording stopped, data length:', recordingData.length);
    
    // Here you would typically process and save the recording data
    // For now, we'll just store it in memory
    
    return { success: true, dataLength: recordingData.length };
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { success: false, error: error.message };
  }
}

async function resetRecording() {
  try {
    recordingData = [];
    
    // Notify content script to reset recording
    if (recordingTabId) {
      try {
        await chrome.tabs.sendMessage(recordingTabId, { 
          type: 'RESET_RECORDING_ON_PAGE' 
        });
      } catch (error) {
        console.error('Error sending message to content script:', error);
      }
    }
    
    console.log('Recording reset');
    return { success: true };
  } catch (error) {
    console.error('Error resetting recording:', error);
    return { success: false, error: error.message };
  }
}

async function verifyToken(token) {
  try {
    // In a real implementation, you would verify the token with your backend
    // For now, we'll just simulate a successful verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { valid: true };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, error: error.message };
  }
}

// Listen for recording data from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RECORDING_DATA' && isRecording) {
    recordingData.push(message.data);
    sendResponse({ received: true });
    return true;
  }
});
