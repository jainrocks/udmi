<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" href="data:,">
    <meta charset="UTF-8">
    <title>Bridgehead Monitor</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<div class="tabs" id="mainNav" style="display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; gap:10px; align-items:center;">
        <button class="tab active" id="summary-tab">Summary</button>
        <button class="tab" id="sequencer-tab">Sequencer</button>
        <button class="tab" id="edit-tab">Edit Device</button>
        <div class="tab-button-container">
            <button id="registrar-btn" class="tab-button">Run Registrar</button>
        </div>
        <div class="tab-button-container">
            <button id="validator-btn" class="tab-button">${validatorBtnText}</button>
        </div>
    </div>
    <span id="message-box" style="color:white; padding-right:50px;"></span>
</div>

<div id="summary-page" class="page${(page == 'summary')?then(' active','')}">
    <div id="dashboard-header">
        <h1>Bridgehead Monitor</h1>
        <h3>MQTT Broker Status: <span id="broker-status"
                                 class="badge badge-${brokerStatusColour}">${mqttConnectionStatus}</span>
            --- Validator Status: <span id="validator-status" class="badge badge-${validatorStatusColour}">${validatorStatus}</span>
        </h3>
    </div>

    <div class="stats-grid">
        <div class="stat-panel">
            <h3>MQTT Active Clients Connected</h3>
            <div id="active-client-count" class="stat-value">${connectedClients}</div>
        </div>

        <div class="stat-panel">
            <h3>Number of Active MQTT Subscriptions</h3>
            <div id="subscription-count" class="stat-value">${subscriptionCount}</div>
        </div>

        <div class="stat-panel">
            <h3>Last Registrar Run </h3>
            <div id="registrar-loading" style="visibility: hidden; display: none;" class="loader"></div>
            <div id="registrar-time" class="stat-value" style="font-size: 1.8em;">${registrarRun}</div>
        </div>
    </div>

    <div class="status-grid">

        <div class="device-status-panel" style="max-height: 400px;">
            <h2 class="panel-title">
                Validated Device Status
                <span class="small-text">Showing first 100 devices.</span>
                <button id="refresh-validation" class="refresh-btn" title="Refresh Data">
                    &#8635;
                </button>
            </h2>

            <div class="text-input search-group">
                <input type="text" id="validator-device-status-search" name="validatorDeviceStatusSearch"
                       placeholder="Search by Device Name...">
                <button id="validator-device-status-search-submit" class="submit">Submit</button>
                <button id="validator-device-status-search-clear" class="clear">Clear</button>
            </div>

            <div class="device-list-container">
                <table>
                    <thead>
                    <tr>
                        <th>Device Name</th>
                        <th>Last Seen</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody id="validator-device-status-table-body">
                    ${validatorDeviceStatusBody}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="device-status-panel" style="max-height: 400px;">
            <h2 class="panel-title">
                Registered Device Status
                <span class="small-text">Showing first 100 devices.</span>
                <button id="refresh-registration" class="refresh-btn" title="Refresh Data">
                    &#8635;
                </button>
            </h2>

            <div class="text-input search-group">
                <input type="text" id="registrar-device-status-search" name="registrarDeviceStatusSearch"
                       placeholder="Search by Device Name...">
                <button id="registrar-device-status-search-submit" class="submit">Submit</button>
                <button id="registrar-device-status-search-clear" class="clear">Clear</button>
            </div>

            <div class="device-list-container">
                <table>
                    <thead>
                    <tr>
                        <th>Device Name</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody id="registrar-device-status-table-body">
                    ${registrarDeviceStatusBody}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div id="sequencer-page" class="page${(page == 'sequencer')?then(' active','')}">
    <div id="dashboard-header">
        <h1>UDMI Sequencer Compliance Testing</h1>
        <h3>Sequencer Status: <span id="sequencer-status" class="badge badge-${sequencerStatusColour}">${sequencerStatus}</span></h3>
    </div>

    <div class="stats-grid">
        <div class="stat-panel">
            <h3>Total Tests</h3>
            <div id="sequencer-total" class="stat-value">${sequencerTotal!0}</div>
        </div>

        <div class="stat-panel">
            <h3>Passed</h3>
            <div id="sequencer-passed" class="stat-value" style="color: #155724;">${sequencerPassed!0}</div>
        </div>

        <div class="stat-panel">
            <h3>Failed</h3>
            <div id="sequencer-failed" class="stat-value" style="color: #721c24;">${sequencerFailed!0}</div>
        </div>

        <div class="stat-panel">
            <h3>Skipped</h3>
            <div id="sequencer-skipped" class="stat-value" style="color: #856404;">${sequencerSkipped!0}</div>
        </div>

        <div class="stat-panel">
            <h3>Last Run</h3>
            <div id="sequencer-last-run" class="stat-value" style="font-size: 1.8em;">${sequencerLastRun!" --- "}</div>
        </div>
    </div>

    <div class="device-status-panel" style="margin-bottom: 20px;">
        <h2 class="panel-title">Run Sequencer Configuration</h2>
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap; margin-bottom: 10px;">
            <div>
                <label for="sequencer-device-select"><strong>Target Device:</strong></label>
                <select id="sequencer-device-select" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;">
                    <#if sequencerDeviceList??>
                        <#list sequencerDeviceList as dev>
                            <option value="${dev}">${dev}</option>
                        </#list>
                    </#if>
                </select>
            </div>
            <div>
                <label for="sequencer-stage-select"><strong>Minimum Stage:</strong></label>
                <select id="sequencer-stage-select" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;">
                    <option value="PREVIEW" selected>PREVIEW (Default)</option>
                    <option value="ALPHA">ALPHA</option>
                    <option value="=ALPHA">=ALPHA (Alpha Only)</option>
                    <option value="BETA">BETA</option>
                    <option value="STABLE">STABLE</option>
                </select>
            </div>
            <div style="flex-grow: 1;">
                <label for="sequencer-sequences-input"><strong>Specific Tests (optional):</strong></label>
                <input type="text" id="sequencer-sequences-input" placeholder="e.g. system_last_update pointset_numeric_values" style="width: 100%; box-sizing: border-box; padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px;">
            </div>
            <div style="align-self: flex-end;">
                <button id="run-sequencer-btn" class="tab-button" style="padding: 8px 18px; font-size: 14px; cursor: pointer;">Run Sequencer</button>
            </div>
        </div>
    </div>

    <div class="device-status-panel">
        <h2 class="panel-title">
            Sequencer Results Matrix
            <button id="refresh-sequencer" class="refresh-btn" title="Refresh Results">&#8635;</button>
        </h2>
        <div class="device-list-container">
            <table>
                <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Result</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody id="sequencer-results-table-body">
                ${sequencerResultsBody!""}
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="edit-device-page" class="page${(page == 'edit')?then(' active','')}">
    <div id="edit-page-layout">

        <div class="device-status-panel" style="height: calc(100vh  - 80px); box-sizing: border-box;">

            <div class="text-input search-group">
                <input type="text" id="device-search" name="deviceMetadataSearch"
                       placeholder="Search by Device Name...">
                <button id="device-search-submit" class="submit">Submit</button>
                <button id="device-search-clear" class="clear">Clear</button>
            </div>

            <div class="device-list-container">
                <table>
                    <tbody id="device-table-body"></tbody>
                </table>
            </div>
        </div>
        <div id="left-pane">
            <div id="edit-bottom-layout">
                <button id="save-metadata" disabled>Save</button>
                <button id="reset-metadata" disabled>Reset</button>
            </div>
            <div id="text-area">
                <textarea class="fullscreen-input" id="device-json" disabled></textarea>
            </div>
        </div>
    </div>
</div>

<script src="js/app.js"></script>
</body>
</html>