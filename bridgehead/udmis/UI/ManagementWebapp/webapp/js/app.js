/* Websocket */
const socket = new WebSocket('ws://localhost:8080/bridgeheadManager/agent');
socket.onopen = function (e) {
  console.log('[open] Connection established');
};


const activeCount = document.getElementById("active-client-count");
const subCount = document.getElementById("subscription-count");
const mqttStatus = document.getElementById('broker-status');
socket.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data && data.subject && data.data) {
    const messageData = data.data;
    switch (data.subject) {
      case "connectedClients": {
        activeCount.textContent = String(messageData);
      } break;
      case "subscriptionCount": {
        subCount.textContent = String(messageData);
      } break;
      case "mqttConnectionStatus": {
        updateMqttStatus(messageData)
      } break;
    }
  };
}

function updateMqttStatus(status) {
  mqttStatus.className = 'badge';

  switch (status) {
    case "Connected": {
      mqttStatus.textContent = "Connected";
      mqttStatus.classList.add('badge-green');
    } break;
    case "Disconnected": {
      mqttStatus.textContent = "Disconnected";
      mqttStatus.classList.add('badge-red');
      activeCount.textContent = "0";
      subCount.textContent = "0";
    } break;
    default: {
      mqttStatus.textContent = "Connecting...";
      mqttStatus.classList.add('badge-yellow');
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Search bar groups
  const searchGroups = document.querySelectorAll('.search-group');
  searchGroups.forEach(group => {
    const input = group.querySelector('input[type="text"]');
    const submitButton = group.querySelector('.submit');
    const clearButton = group.querySelector('.clear');

    if (!input) {
      return;
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchFunction(input);
      }
    });

    if (submitButton) {
      submitButton.addEventListener('click', function () {
        searchFunction(input);
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        input.value = "";
        searchFunction(input);
      });
    }
  })

});

const validatorRefresh = document.getElementById('refresh-validation');
const registrarRefresh = document.getElementById('refresh-registration');

validatorRefresh.addEventListener('click', () => {
  valInput = document.getElementById('validator-device-status-search');
  valInput.value = "";
  searchFunction(valInput);
}); 

registrarRefresh.addEventListener('click', () => {
  regInput = document.getElementById('registrar-device-status-search');
  regInput.value = "";
  searchFunction(regInput);
});

function searchFunction(input) {
  const name = input.name;
  fetch(`?action=${name}&deviceName=${input.value}`)
    .then(response => response.text())
    .then(html => {

      switch (name) {
        case "registrarDeviceStatusSearch": {
          const statusTable = document.getElementById('registrar-device-status-table-body');
          statusTable.innerHTML = html;
        } break;
        case "validatorDeviceStatusSearch": {
          const statusTable = document.getElementById('validator-device-status-table-body');
          statusTable.innerHTML = html;
        } break;
        case "deviceMetadataSearch": {
          const deviceTable = document.getElementById('device-table-body');
          deviceTable.innerHTML = html;
          const getMetadataButtons = document.querySelectorAll('.get-metadata');
          getMetadataButtons.forEach(button => {
            button.addEventListener("click", () => {
              const path = button.dataset.path;
              if (deviceJson.hasAttribute('disabled')) {
                deviceJson.removeAttribute('disabled');
                saveJson.removeAttribute('disabled');
                resetJson.removeAttribute('disabled');
              }
              getMetadataJson(path);
            })
          })
        } break;
      }
    })
    .catch(err => console.error("Error getting devices status':", err));
}

const summaryBtn = document.getElementById('summary-tab');
const sequencerBtn = document.getElementById('sequencer-tab');
const editBtn = document.getElementById('edit-tab');
const summaryPage = document.getElementById('summary-page');
const sequencerPage = document.getElementById('sequencer-page');
const editPage = document.getElementById('edit-device-page');

summaryBtn.addEventListener("click", () => {
  editPage.classList.remove('active');
  sequencerPage.classList.remove('active');
  summaryPage.classList.add('active');
  editBtn.classList.remove('active');
  sequencerBtn.classList.remove('active');
  summaryBtn.classList.add('active');
})

sequencerBtn.addEventListener("click", () => {
  summaryPage.classList.remove('active');
  editPage.classList.remove('active');
  sequencerPage.classList.add('active');
  summaryBtn.classList.remove('active');
  editBtn.classList.remove('active');
  sequencerBtn.classList.add('active');
  loadSequencerDevices();
  const selectedDev = document.getElementById('sequencer-device-select').value;
  if (selectedDev) {
    refreshSequencerData(selectedDev);
  }
})

editBtn.addEventListener("click", () => {
  summaryPage.classList.remove('active');
  sequencerPage.classList.remove('active');
  editPage.classList.add('active');
  summaryBtn.classList.remove('active');
  sequencerBtn.classList.remove('active');
  editBtn.classList.add('active');
  const deviceList = document.getElementById('device-search');
  searchFunction(deviceList);
})


const deviceJson = document.getElementById('device-json');
deviceJson.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    e.preventDefault();

    const start = this.selectionStart;
    const end = this.selectionEnd;

    this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 2;
  }
});


const saveJson = document.getElementById('save-metadata');
saveJson.addEventListener("click", () => {
  try {
    JSON.parse(deviceJson.value);
  } catch (error) {
    showErrorMessage("Not a valid json object: " + error);
    return;
  }

  fetch(`?action=saveMetadata&path=${deviceJson.dataset.path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: deviceJson.value
  }).then(response => {
    if (!response.ok) {
      throw new Error('Bad response whilst having metadata file: ' + response.statusText);
    }
    return response.json();
  })
    .then(data => {
      const message = data.message;
      if (data.messgeType === 'error') {
        showErrorMessage(message);
      } else {
        showInfoMessage(message);
      }
    })
    .catch(error => {
      showErrorMessage("Error occurred whilst attempting save, file may not have been saved successfully")
      console.error('There was a problem with the fetch operation:', error);
    });
})


const resetJson = document.getElementById('reset-metadata');
resetJson.addEventListener("click", () => {
  getMetadataJson(deviceJson.dataset.path);
})


function getMetadataJson(path) {
  fetch(`?action=getMetadata&path=${path}`)
    .then(response => response.text())
    .then(metadataJson => {
      const metadataObject = JSON.parse(metadataJson);
      const prettyJsonString = JSON.stringify(metadataObject, null, 2);
      deviceJson.value = prettyJsonString;
      deviceJson.dataset.path = path;
    });
}

let timeoutId;
function showInfoMessage(message) {
  showMessage(message, "white")
}

function showErrorMessage(message, element = null) {
  showMessage(message, "#ff3030")
}

const messageBox = document.getElementById('message-box');
function showMessage(message, colour) {
  clearTimeout(timeoutId);
  messageBox.textContent = message;
  messageBox.style.color = colour;
  messageBox.classList.add("show");

  timeoutId = setTimeout(() => {
    messageBox.classList.remove("show");
    messageBox.textContent = "";
  }, 5000);
}

const registrarBtn = document.getElementById('registrar-btn');
const registrarTime = document.getElementById('registrar-time');
const registrarLoading = document.getElementById('registrar-loading');
registrarBtn.addEventListener("click", () => {
  show(registrarLoading);
  hide(registrarTime);
  fetch('?action=runRegistrar')
    .then(response => response.text())
    .then(replyJson => {
      const data = JSON.parse(replyJson);
      const registrarTime = document.getElementById('registrar-time');
      registrarTime.innerHTML = data.time;
      const registrarDevices = document.getElementById('registrar-device-status-table-body');
      registrarDevices.innerHTML = data.devices;
      hide(registrarLoading);
      show(registrarTime);
    })
})

const validatorBtn = document.getElementById('validator-btn');
const validatorStatus = document.getElementById('validator-status');
validatorBtn.addEventListener("click", () => {
  validatorStatus.classList.add('badge-yellow');
  if(validatorBtn.textContent == "Start Validator"){
    validatorStatus.textContent = "Starting";
  }else{
    validatorStatus.textContent = "Restarting";
  }

  fetch('?action=runValidator')
    .then(response => response.text())
    .then(status => {
      validatorStatus.className = 'badge';
      if (status === "Running") {
        validatorStatus.textContent = status;
        validatorStatus.classList.add('badge-green');
        validatorBtn.textContent = "Restart Validator";
      } else {
        validatorStatus.textContent = status;
        validatorStatus.classList.add('badge-red');
      }
    })
})

function hide(element) {
  element.style.visibility = 'hidden';
  element.style.display = 'none';
}

function show(element) {
  element.style.visibility = 'visible';
  element.style.display = 'block';
}

/* Sequencer Controls */
const runSequencerBtn = document.getElementById('run-sequencer-btn');
const refreshSequencerBtn = document.getElementById('refresh-sequencer');
const sequencerStatusBadge = document.getElementById('sequencer-status');
const sequencerDeviceSelect = document.getElementById('sequencer-device-select');
const sequencerStageSelect = document.getElementById('sequencer-stage-select');
const sequencerSequencesInput = document.getElementById('sequencer-sequences-input');

let sequencerPollInterval = null;

function loadSequencerDevices() {
  if (!sequencerDeviceSelect) return;
  fetch('?action=getSequencerDevices')
    .then(response => response.json())
    .then(devices => {
      const currentVal = sequencerDeviceSelect.value;
      sequencerDeviceSelect.innerHTML = '';
      devices.forEach(dev => {
        const opt = document.createElement('option');
        opt.value = dev;
        opt.textContent = dev;
        if (dev === currentVal) opt.selected = true;
        sequencerDeviceSelect.appendChild(opt);
      });
    })
    .catch(err => console.error('Error fetching sequencer devices:', err));
}

if (sequencerDeviceSelect) {
  sequencerDeviceSelect.addEventListener('change', () => {
    refreshSequencerData(sequencerDeviceSelect.value);
  });
}

if (refreshSequencerBtn) {
  refreshSequencerBtn.addEventListener('click', () => {
    const dev = sequencerDeviceSelect ? sequencerDeviceSelect.value : '';
    if (dev) {
      refreshSequencerData(dev);
    }
  });
}

function refreshSequencerData(deviceId) {
  if (!deviceId) return;
  fetch(`?action=sequencerStatus&deviceId=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(summary => {
      updateSequencerSummary(summary);
    })
    .catch(err => console.error('Error fetching sequencer status:', err));

  fetch(`?action=sequencerReport&deviceId=${encodeURIComponent(deviceId)}`)
    .then(response => response.text())
    .then(html => {
      const resultsTable = document.getElementById('sequencer-results-table-body');
      if (resultsTable) {
        resultsTable.innerHTML = html;
      }
    })
    .catch(err => console.error('Error fetching sequencer report:', err));
}

function updateSequencerSummary(summary) {
  if (!summary) return;
  const statusElem = document.getElementById('sequencer-status');
  const totalElem = document.getElementById('sequencer-total');
  const passedElem = document.getElementById('sequencer-passed');
  const failedElem = document.getElementById('sequencer-failed');
  const skippedElem = document.getElementById('sequencer-skipped');
  const lastRunElem = document.getElementById('sequencer-last-run');

  if (statusElem) {
    statusElem.className = 'badge';
    statusElem.textContent = summary.status || 'Not Started';
    if (summary.status === 'Running') {
      statusElem.classList.add('badge-yellow');
    } else if (summary.status === 'Completed') {
      statusElem.classList.add('badge-green');
    } else if (summary.status === 'Failed') {
      statusElem.classList.add('badge-red');
    } else {
      statusElem.classList.add('badge-yellow');
    }
  }

  if (totalElem) totalElem.textContent = summary.total !== undefined ? summary.total : '0';
  if (passedElem) passedElem.textContent = summary.passed !== undefined ? summary.passed : '0';
  if (failedElem) failedElem.textContent = summary.failed !== undefined ? summary.failed : '0';
  if (skippedElem) skippedElem.textContent = summary.skipped !== undefined ? summary.skipped : '0';
  if (lastRunElem) lastRunElem.textContent = summary.lastRun || ' --- ';
}

if (runSequencerBtn) {
  runSequencerBtn.addEventListener('click', () => {
    const deviceId = sequencerDeviceSelect ? sequencerDeviceSelect.value : '';
    const minStage = sequencerStageSelect ? sequencerStageSelect.value : 'PREVIEW';
    const sequences = sequencerSequencesInput ? sequencerSequencesInput.value : '';

    if (!deviceId) {
      showErrorMessage('Please select a target device.');
      return;
    }

    runSequencerBtn.disabled = true;
    if (sequencerStatusBadge) {
      sequencerStatusBadge.className = 'badge badge-yellow';
      sequencerStatusBadge.textContent = 'Running...';
    }

    fetch(`?action=runSequencer&deviceId=${encodeURIComponent(deviceId)}&minStage=${encodeURIComponent(minStage)}&sequences=${encodeURIComponent(sequences)}`)
      .then(response => response.json())
      .then(data => {
        showInfoMessage('Sequencer started for ' + deviceId);
        startPollingSequencer(deviceId);
      })
      .catch(err => {
        showErrorMessage('Failed to start Sequencer: ' + err);
        runSequencerBtn.disabled = false;
      });
  });
}

function startPollingSequencer(deviceId) {
  if (sequencerPollInterval) clearInterval(sequencerPollInterval);
  sequencerPollInterval = setInterval(() => {
    fetch(`?action=sequencerStatus&deviceId=${encodeURIComponent(deviceId)}`)
      .then(response => response.json())
      .then(summary => {
        updateSequencerSummary(summary);
        if (summary.status !== 'Running') {
          clearInterval(sequencerPollInterval);
          sequencerPollInterval = null;
          if (runSequencerBtn) runSequencerBtn.disabled = false;
          refreshSequencerData(deviceId);
          if (summary.status === 'Completed') {
            showInfoMessage('Sequencer finished successfully.');
          } else {
            showErrorMessage('Sequencer finished with failures.');
          }
        }
      })
      .catch(err => {
        console.error('Error polling sequencer status:', err);
      });
  }, 3000);
}