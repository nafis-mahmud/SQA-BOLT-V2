document.addEventListener('DOMContentLoaded', async () => {
  const statusCard = document.getElementById('statusCard');
  const statusContent = document.getElementById('statusContent');
  const activationForm = document.getElementById('activationForm');
  const licenseKeyInput = document.getElementById('licenseKey');
  const activateButton = document.getElementById('activate');
  const errorDiv = document.getElementById('error');
  
  // Recording controls
  const recordingControls = document.getElementById('recordingControls');
  const recordingStatus = document.getElementById('recordingStatus');
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');
  const recordAgainBtn = document.getElementById('recordAgain');

  let isRecording = false;

  updateStatus();

  activateButton.addEventListener('click', async () => {
    const licenseKey = licenseKeyInput.value.trim();
    
    if (!licenseKey) {
      showError('Please enter a license key');
      return;
    }

    activateButton.disabled = true;
    activateButton.textContent = 'Activating...';
    
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'ACTIVATE_LICENSE',
        licenseKey
      });

      if (result.success) {
        updateStatus();
      } else {
        showError(result.error || 'Activation failed');
      }
    } catch (error) {
      showError('Failed to activate license. Please try again.');
    } finally {
      activateButton.disabled = false;
      activateButton.textContent = 'Activate';
    }
  });

  // Recording control event listeners
  startRecordingBtn.addEventListener('click', () => {
    startRecording();
  });

  stopRecordingBtn.addEventListener('click', () => {
    stopRecording();
  });

  recordAgainBtn.addEventListener('click', () => {
    resetRecording();
  });

  async function updateStatus() {
    try {
      const status = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      
      if (status.isActivated) {
        statusCard.classList.add('status-active');
        statusCard.classList.remove('status-inactive');
        
        const expiresAt = status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'Never';
        const lastValidation = status.lastValidation ? new Date(status.lastValidation).toLocaleDateString() : 'Never';
        
        statusContent.innerHTML = `
          <p><strong>Status:</strong> ${status.licenseStatus || 'Active'}</p>
          <p><strong>License:</strong> ${status.licenseKey}</p>
          <p><strong>Expires:</strong> ${expiresAt}</p>
          <p><strong>Last Validated:</strong> ${lastValidation}</p>
        `;
        
        activationForm.style.display = 'none';
        recordingControls.style.display = 'flex'; // Show recording controls when activated
      } else {
        statusCard.classList.add('status-inactive');
        statusCard.classList.remove('status-active');
        statusContent.innerHTML = '<p>License not activated</p>';
        activationForm.style.display = 'block';
        recordingControls.style.display = 'none'; // Hide recording controls when not activated
      }
    } catch (error) {
      statusContent.innerHTML = '<p>Error loading license status</p>';
      activationForm.style.display = 'block';
      recordingControls.style.display = 'none';
      showError('Failed to load license status');
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  function startRecording() {
    isRecording = true;
    
    // Update UI
    recordingStatus.textContent = 'Recording...';
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    recordAgainBtn.disabled = true;
    
    // Send message to background script to start recording
    chrome.runtime.sendMessage({
      type: 'START_RECORDING'
    });
  }

  function stopRecording() {
    isRecording = false;
    
    // Update UI
    recordingStatus.textContent = 'Recording stopped';
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = true;
    recordAgainBtn.disabled = false;
    
    // Send message to background script to stop recording
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING'
    });
  }

  function resetRecording() {
    // Update UI
    recordingStatus.textContent = 'Ready to record';
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    recordAgainBtn.disabled = true;
    
    // Sen<boltAction type="file" filePath="extension/popup.js">    // Send message to background script to reset recording
    chrome.runtime.sendMessage({
      type: 'RESET_RECORDING'
    });
  }
});
