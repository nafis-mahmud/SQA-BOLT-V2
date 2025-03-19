// Recording state
let isRecording = false;
let recordingData = [];
let recordingInterval = null;

// Listen for messages from the web app
window.addEventListener('message', async (event) => {
  // Only accept messages from our web app domain
  if (event.origin !== 'https://app.supplychainhub.com') return;
  
  // Handle auth token updates
  if (event.data && event.data.type === 'FROM_WEBAPP') {
    switch (event.data.action) {
      case 'authTokenResponse':
      case 'authTokenChanged':
        handleAuthToken(event.data.token);
        break;
    }
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING_ON_PAGE') {
    startRecordingOnPage();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'STOP_RECORDING_ON_PAGE') {
    stopRecordingOnPage();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'RESET_RECORDING_ON_PAGE') {
    resetRecordingOnPage();
    sendResponse({ success: true });
    return true;
  }
});

// Request auth token from web app
function requestAuthToken() {
  window.postMessage({ 
    type: 'FROM_EXTENSION',
    action: 'getAuthToken'
  }, '*');
}

// Handle received auth token
async function handleAuthToken(token) {
  if (!token) return;
  
  try {
    // Verify token with background script
    const response = await chrome.runtime.sendMessage({
      type: 'VERIFY_TOKEN',
      token
    });
    
    if (response.valid) {
      console.log('Token verified successfully');
    } else {
      console.error('Token verification failed');
    }
  } catch (error) {
    console.error('Error verifying token:', error);
  }
}

// Recording functions
function startRecordingOnPage() {
  if (isRecording) return;
  
  isRecording = true;
  recordingData = [];
  
  // Create a visual indicator that recording is in progress
  createRecordingIndicator();
  
  // Start collecting data
  startDataCollection();
  
  console.log('Recording started on page');
}

function stopRecordingOnPage() {
  if (!isRecording) return;
  
  isRecording = false;
  
  // Stop collecting data
  stopDataCollection();
  
  // Update recording indicator
  updateRecordingIndicator('stopped');
  
  // Send collected data to background script
  chrome.runtime.sendMessage({
    type: 'RECORDING_DATA',
    data: recordingData
  });
  
  console.log('Recording stopped on page');
}

function resetRecordingOnPage() {
  recordingData = [];
  
  // Remove recording indicator
  removeRecordingIndicator();
  
  console.log('Recording reset on page');
}

function startDataCollection() {
  // Record initial page state
  recordPageState();
  
  // Set up event listeners for user interactions
  document.addEventListener('click', recordUserInteraction);
  document.addEventListener('input', recordUserInteraction);
  document.addEventListener('change', recordUserInteraction);
  
  // Periodically record page state
  recordingInterval = setInterval(() => {
    if (isRecording) {
      recordPageState();
    }
  }, 5000); // Record every 5 seconds
}

function stopDataCollection() {
  // Remove event listeners
  document.removeEventListener('click', recordUserInteraction);
  document.removeEventListener('input', recordUserInteraction);
  document.removeEventListener('change', recordUserInteraction);
  
  // Clear interval
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
}

function recordPageState() {
  if (!isRecording) return;
  
  const pageData = {
    type: 'pageState',
    timestamp: Date.now(),
    url: window.location.href,
    title: document.title,
    // Add more page state data as needed
  };
  
  recordingData.push(pageData);
}

function recordUserInteraction(event) {
  if (!isRecording) return;
  
  const interactionData = {
    type: 'userInteraction',
    timestamp: Date.now(),
    eventType: event.type,
    targetElement: getElementPath(event.target),
    // Add more interaction data as needed
  };
  
  recordingData.push(interactionData);
}

function getElementPath(element) {
  if (!element || !element.tagName) return '';
  
  let path = element.tagName.toLowerCase();
  
  if (element.id) {
    path += `#${element.id}`;
  } else if (element.className && typeof element.className === 'string') {
    path += `.${element.className.replace(/\s+/g, '.')}`;
  }
  
  return path;
}

// UI functions for recording indicator
function createRecordingIndicator() {
  removeRecordingIndicator(); // Remove any existing indicator
  
  const indicator = document.createElement('div');
  indicator.id = 'sch-recording-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(234, 67, 53, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 9999;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  `;
  
  const recordingDot = document.createElement('span');
  recordingDot.style.cssText = `
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 50%;
    margin-right: 8px;
    animation: pulse 1.5s infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
  `;
  
  document.head.appendChild(style);
  
  const text = document.createTextNode('Recording...');
  
  indicator.appendChild(recordingDot);
  indicator.appendChild(text);
  document.body.appendChild(indicator);
}

function updateRecordingIndicator(status) {
  const indicator = document.getElementById('sch-recording-indicator');
  if (!indicator) return;
  
  if (status === 'stopped') {
    indicator.style.backgroundColor = 'rgba(52, 168, 83, 0.9)';
    indicator.innerHTML = 'Recording saved';
    
    // Remove after a few seconds
    setTimeout(() => {
      removeRecordingIndicator();
    }, 3000);
  }
}

function removeRecordingIndicator() {
  const indicator = document.getElementById('sch-recording-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Initialize content script
requestAuthToken();
