// ==UserScript==
// @name         Workday Time Entry Helper
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Quick multi-entry time tracking for Workday
// @match        https://*.myworkday.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================== MODAL STYLES ====================
    const styles = `
        .wd-helper-overlay {
            position: fixed;
            top: 0;
            right: 0;
            width: auto;
            height: auto;
            background: transparent;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            pointer-events: none;
        }

        .wd-helper-modal {
            background: white;
            border-radius: 12px;
            padding: 24px;
            min-width: 500px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            margin: 20px;
            pointer-events: auto;
        }

        .wd-helper-overlay.centered {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .wd-helper-overlay.centered .wd-helper-modal {
            min-width: 700px;
            max-width: 900px;
            margin: 0;
        }

        .wd-helper-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .wd-helper-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
        }

        .wd-helper-date {
            font-size: 14px;
            color: #666;
            background: #f0f0f0;
            padding: 4px 12px;
            border-radius: 4px;
        }

        .wd-helper-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .wd-helper-table th {
            text-align: left;
            padding: 8px 12px;
            background: #f5f5f5;
            font-size: 12px;
            font-weight: 600;
            color: #555;
            border-bottom: 2px solid #ddd;
        }

        .wd-helper-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        .wd-helper-table tr:hover {
            background: #fafafa;
        }

        .wd-helper-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }

        .wd-helper-input:focus {
            outline: none;
            border-color: #0875e1;
            box-shadow: 0 0 0 2px rgba(8, 117, 225, 0.1);
        }

        .wd-helper-input-small {
            width: 70px;
            text-align: center;
        }

        .wd-helper-input-project {
            width: 100%;
            min-width: 200px;
        }

        .wd-helper-input-comment {
            width: 100%;
            min-width: 150px;
        }

        .wd-helper-btn-icon {
            width: 28px;
            height: 28px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .wd-helper-btn-add {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .wd-helper-btn-add:hover {
            background: #c8e6c9;
        }

        .wd-helper-btn-remove {
            background: #ffebee;
            color: #c62828;
        }

        .wd-helper-btn-remove:hover {
            background: #ffcdd2;
        }

        .wd-helper-actions {
            display: flex;
            gap: 4px;
        }

        .wd-helper-buttons {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #eee;
        }

        .wd-helper-buttons-right {
            display: flex;
            gap: 10px;
        }

        .wd-helper-btn {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .wd-helper-btn-cancel {
            background: #f5f5f5;
            border: 1px solid #ddd;
            color: #555;
        }

        .wd-helper-btn-cancel:hover {
            background: #eee;
        }

        .wd-helper-btn-submit {
            background: #0875e1;
            border: 1px solid #0875e1;
            color: white;
        }

        .wd-helper-btn-submit:hover {
            background: #0666c7;
        }

        .wd-helper-status {
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            display: none;
            margin-top: 12px;
        }

        .wd-helper-status.info {
            display: block;
            background: #e8f4fc;
            color: #0875e1;
        }

        .wd-helper-status.error {
            display: block;
            background: #fdeaea;
            color: #d32f2f;
        }

        .wd-helper-status.success {
            display: block;
            background: #e8f5e9;
            color: #2e7d32;
        }

        .wd-helper-total {
            font-size: 14px;
            color: #333;
        }

        .wd-helper-total-hours {
            font-weight: 600;
            color: #0875e1;
        }

        .wd-helper-autocomplete-wrapper {
            position: relative;
        }

        .wd-helper-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 150px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 4px 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
        }

        .wd-helper-suggestions.show {
            display: block;
        }

        .wd-helper-suggestion {
            padding: 6px 10px;
            cursor: pointer;
            font-size: 12px;
            border-bottom: 1px solid #eee;
        }

        .wd-helper-suggestion:last-child {
            border-bottom: none;
        }

        .wd-helper-suggestion:hover,
        .wd-helper-suggestion.selected {
            background: #e8f4fc;
        }

        .wd-helper-suggestion-id {
            font-weight: 600;
            color: #0875e1;
        }

        .wd-helper-suggestion-name {
            color: #555;
            margin-left: 6px;
            font-size: 11px;
        }

        .wd-helper-progress {
            margin-top: 12px;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 6px;
            display: none;
        }

        .wd-helper-progress.show {
            display: block;
        }

        .wd-helper-progress-text {
            font-size: 13px;
            color: #333;
            margin-bottom: 8px;
        }

        .wd-helper-progress-bar {
            height: 6px;
            background: #ddd;
            border-radius: 3px;
            overflow: hidden;
        }

        .wd-helper-progress-fill {
            height: 100%;
            background: #0875e1;
            transition: width 0.3s;
        }

        .wd-helper-workday-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            border: 1px solid #e0e0e0;
        }

        .wd-helper-section-label {
            font-size: 12px;
            font-weight: 500;
            color: #666;
            margin-bottom: 8px;
        }

        .wd-helper-workday-row {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .wd-helper-field-inline {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .wd-helper-label-small {
            font-size: 12px;
            color: #555;
        }

        .wd-helper-input-time {
            width: 70px;
            text-align: center;
        }

        .wd-helper-workday-total {
            font-size: 14px;
            font-weight: 600;
            color: #0875e1;
            margin-left: auto;
        }

        .wd-helper-mismatch {
            color: #d32f2f !important;
        }

        .wd-helper-match {
            color: #2e7d32 !important;
        }

        .wd-helper-remaining {
            font-size: 12px;
            margin-left: 8px;
            padding: 2px 8px;
            border-radius: 4px;
            background: #fff3e0;
            color: #e65100;
        }

        .wd-helper-remaining.done {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .wd-helper-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 12px;
        }

        .wd-helper-loading-text {
            font-size: 14px;
            color: #0875e1;
            text-align: center;
        }

        .wd-helper-modal {
            position: relative;
        }

        .wd-helper-action-required {
            background: #fff3e0;
            border: 2px solid #ff9800;
            border-radius: 8px;
            padding: 16px 20px;
            margin-top: 12px;
            text-align: center;
        }

        .wd-helper-action-title {
            font-size: 16px;
            font-weight: 600;
            color: #e65100;
            margin-bottom: 8px;
        }

        .wd-helper-action-day {
            font-size: 24px;
            font-weight: 700;
            color: #e65100;
            background: white;
            display: inline-block;
            padding: 8px 20px;
            border-radius: 6px;
            margin: 8px 0;
            border: 2px solid #ff9800;
        }

        .wd-helper-action-disclaimer {
            font-size: 11px;
            color: #888;
            margin-top: 10px;
            font-style: italic;
        }
    `;

    // ==================== INJECT STYLES ====================
    function injectStyles() {
        if (document.getElementById('wd-helper-styles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'wd-helper-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    // ==================== PROJECT CACHE ====================
    let cachedProjects = [];
    let projectsFetched = false;
    let projectsLoading = false;

    // ==================== TIME ENTRIES DATA ====================
    let timeEntries = [
        { project: '', duration: '', comment: '' }
    ];

    // ==================== UTILITY FUNCTIONS ====================

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function simulateClick(element) {
        // Use pointer events as Workday listens for these
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }

    function simulateDoubleClick(element) {
        element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
    }

    function waitForElement(selector, textContent = null, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function check() {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    if (!textContent || el.textContent.includes(textContent)) {
                        resolve(el);
                        return;
                    }
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for element: ${selector}${textContent ? ` with text "${textContent}"` : ''}`));
                    return;
                }

                requestAnimationFrame(check);
            }

            check();
        });
    }

    function waitForDialogClose(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function check() {
                const dialog = document.querySelector('[data-automation-id="enterTimeDialog"], [role="dialog"]');
                if (!dialog || dialog.offsetParent === null) {
                    resolve();
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for dialog to close'));
                    return;
                }

                setTimeout(check, 200);
            }

            check();
        });
    }

    // Parse duration input (flexible: 4, 4.5, 4:30, 4h30, etc.)
    function parseDuration(input) {
        if (!input) return null;
        input = input.trim().toLowerCase();

        // Format: H:MM or HH:MM
        if (input.includes(':')) {
            const parts = input.split(':');
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            return hours * 60 + minutes;
        }

        // Format: Hh or HhMM (e.g., 4h, 4h30)
        if (input.includes('h')) {
            const parts = input.split('h');
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            return hours * 60 + minutes;
        }

        // Format: decimal (e.g., 4.5 for 4 hours 30 min)
        if (input.includes('.') || input.includes(',')) {
            const num = parseFloat(input.replace(',', '.'));
            if (!isNaN(num)) {
                return Math.round(num * 60);
            }
        }

        // Format: plain number (assume hours)
        const num = parseFloat(input);
        if (!isNaN(num)) {
            return Math.round(num * 60);
        }

        return null;
    }

    // Convert minutes to HH:MM format (offset from a start time)
    function minutesToTime(minutes, startHour = 8, startMinute = 0) {
        const totalMinutes = startHour * 60 + startMinute + minutes;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Convert absolute minutes from midnight to HH:MM format
    function minutesToTimeAbsolute(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Format duration for display
    function formatDuration(minutes) {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours}h`;
        return `${hours}h${mins.toString().padStart(2, '0')}`;
    }

    // Get current date from Workday dialog
    function getCurrentDateFromDialog() {
        // Strategy 1: Find by data-automation-id="textView" containing date format
        const textViews = document.querySelectorAll('[data-automation-id="textView"]');
        for (const tv of textViews) {
            const text = tv.textContent.trim();
            // Match date format DD.MM.YYYY
            const match = text.match(/^(\d{2}\.\d{2}\.\d{4})$/);
            if (match) {
                console.log('Found date in textView:', match[1]);
                return match[1];
            }
        }

        // Strategy 2: Find by datePickerInput
        const dateEl = document.querySelector('[data-automation-id="datePickerInput"]');
        if (dateEl) return dateEl.value;

        // Strategy 3: Try to find date in dialog header
        const dialog = document.querySelector('[role="dialog"], [data-automation-id="popUpDialog"]');
        if (dialog) {
            const text = dialog.textContent;
            const match = text.match(/(\d{2}\.\d{2}\.\d{4})/);
            if (match) return match[1];
        }

        return 'Today';
    }

    // ==================== PROJECT FETCHING ====================

    async function fetchProjectsFromWorkday(statusCallback) {
        if (projectsLoading) {
            console.log('Projects already loading, skipping');
            return cachedProjects;
        }

        projectsLoading = true;

        if (statusCallback) statusCallback('Loading projects... Please wait, do not click.');

        try {
            let timeTypeInput = document.querySelector('input[class*="InputContainer"]');
            if (!timeTypeInput) {
                timeTypeInput = document.querySelector('input[id$="-input"]');
            }

            if (!timeTypeInput) {
                throw new Error('Please open the "Enter Time" dialog first');
            }

            simulateClick(timeTypeInput);
            await delay(300);

            const projectsOption = await waitForElement('[id^="promptOption-"]', 'Projects', 3000);
            simulateClick(projectsOption);
            await delay(500);

            const projects = [];
            const seenIds = new Set();

            const collectProjects = () => {
                const elements = document.querySelectorAll('[id^="promptOption-"]');
                for (const el of elements) {
                    const text = el.textContent.trim();
                    const match = text.match(/^(PRJ\d+)\s+(.+)$/);
                    if (match && !seenIds.has(match[1])) {
                        seenIds.add(match[1]);
                        projects.push({
                            id: match[1],
                            name: match[2],
                            fullText: text
                        });
                    }
                }
            };

            const firstOption = document.querySelector('[id^="promptOption-"]');
            let scrollContainer = document.querySelector('ul.WGLO') || firstOption?.closest('ul');
            if (!scrollContainer) {
                scrollContainer = firstOption?.parentElement;
                while (scrollContainer && scrollContainer !== document.body) {
                    if (scrollContainer.scrollHeight > scrollContainer.clientHeight + 10) {
                        break;
                    }
                    scrollContainer = scrollContainer.parentElement;
                }
            }

            let prevCount = 0;
            let stuckCount = 0;

            for (let i = 0; i < 50; i++) {
                collectProjects();

                if (projects.length === prevCount) {
                    stuckCount++;
                    if (stuckCount > 3) break;
                } else {
                    stuckCount = 0;
                    prevCount = projects.length;
                }

                if (statusCallback) statusCallback(`Loading projects... (${projects.length} found) - Please wait`);

                const allOptions = document.querySelectorAll('[id^="promptOption-"]');
                if (allOptions.length > 0) {
                    allOptions[allOptions.length - 1].scrollIntoView({ behavior: 'instant', block: 'end' });
                }

                await delay(200);
            }

            // Close dropdown
            const dialogTitle = document.querySelector('[class*="Dialog"] h2, [role="dialog"] h2');
            if (dialogTitle) {
                simulateClick(dialogTitle);
            }

            cachedProjects = projects;
            projectsFetched = true;
            projectsLoading = false;

            if (statusCallback) statusCallback(`Loaded ${projects.length} projects. Ready!`);

            return projects;

        } catch (error) {
            console.error('Error fetching projects:', error);
            projectsLoading = false;
            if (statusCallback) statusCallback(`Error: ${error.message}`);
            return [];
        }
    }

    // ==================== MODAL HTML ====================

    function createMultiEntryModal() {
        const currentDate = getCurrentDateFromDialog();

        const overlay = document.createElement('div');
        overlay.className = 'wd-helper-overlay';
        overlay.innerHTML = `
            <div class="wd-helper-modal">
                <div class="wd-helper-header">
                    <h2 class="wd-helper-title">Time Entry</h2>
                    <span class="wd-helper-date" id="wd-current-date">${currentDate}</span>
                </div>

                <div class="wd-helper-workday-section">
                    <div class="wd-helper-section-label">Daily Work Time (optional)</div>
                    <div class="wd-helper-workday-row">
                        <div class="wd-helper-field-inline">
                            <label class="wd-helper-label-small">From</label>
                            <input type="text" class="wd-helper-input wd-helper-input-time" id="wd-workday-from" placeholder="0800">
                        </div>
                        <div class="wd-helper-field-inline">
                            <label class="wd-helper-label-small">To</label>
                            <input type="text" class="wd-helper-input wd-helper-input-time" id="wd-workday-to" placeholder="1700">
                        </div>
                        <div class="wd-helper-field-inline">
                            <label class="wd-helper-label-small">Break</label>
                            <input type="text" class="wd-helper-input wd-helper-input-time" id="wd-workday-break" placeholder="30">
                        </div>
                        <div class="wd-helper-workday-total">
                            <span id="wd-workday-total">= 0h</span>
                        </div>
                    </div>
                </div>

                <table class="wd-helper-table">
                    <thead>
                        <tr>
                            <th style="width: 40%">Project</th>
                            <th style="width: 100px">Duration</th>
                            <th>Comment</th>
                            <th style="width: 70px">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="wd-entries-body">
                    </tbody>
                </table>

                <div class="wd-helper-status" id="wd-status"></div>

                <div class="wd-helper-action-required" id="wd-action-required" style="display: none;">
                    <div class="wd-helper-action-title">Please click on day</div>
                    <div class="wd-helper-action-day" id="wd-action-day">8</div>
                    <div>in the month view to continue</div>
                    <div class="wd-helper-action-disclaimer">Manual click required due to Workday's isTrusted security check on events</div>
                </div>

                <div class="wd-helper-progress" id="wd-progress">
                    <div class="wd-helper-progress-text" id="wd-progress-text">Processing...</div>
                    <div class="wd-helper-progress-bar">
                        <div class="wd-helper-progress-fill" id="wd-progress-fill" style="width: 0%"></div>
                    </div>
                </div>

                <div class="wd-helper-loading-overlay" id="wd-loading-overlay" style="display: none;">
                    <div class="wd-helper-loading-text" id="wd-loading-text">Loading projects...</div>
                </div>

                <div class="wd-helper-buttons">
                    <div class="wd-helper-total">
                        Total: <span class="wd-helper-total-hours" id="wd-total-hours">0h</span>
                        <span class="wd-helper-remaining" id="wd-remaining"></span>
                    </div>
                    <div class="wd-helper-buttons-right">
                        <button class="wd-helper-btn" id="wd-import-clipboard" style="background: #e3f2fd; color: #0d47a1; margin-right: auto;">Import from Clipboard</button>
                    </div>
                    <div class="wd-helper-buttons-right">
                        <button class="wd-helper-btn wd-helper-btn-cancel" id="wd-cancel">Cancel</button>
                        <button class="wd-helper-btn wd-helper-btn-submit" id="wd-submit">Submit All</button>
                    </div>
                </div>
            </div>
        `;
        return overlay;
    }

    function renderEntryRow(index, entry) {
        return `
            <tr data-index="${index}">
                <td>
                    <div class="wd-helper-autocomplete-wrapper">
                        <input type="text" class="wd-helper-input wd-helper-input-project"
                               data-field="project" data-index="${index}"
                               value="${entry.project}"
                               placeholder="Type to search..." autocomplete="off">
                        <div class="wd-helper-suggestions" data-index="${index}"></div>
                    </div>
                </td>
                <td>
                    <input type="text" class="wd-helper-input wd-helper-input-small"
                           data-field="duration" data-index="${index}"
                           value="${entry.duration}"
                           placeholder="e.g. 4:30">
                </td>
                <td>
                    <input type="text" class="wd-helper-input wd-helper-input-comment"
                           data-field="comment" data-index="${index}"
                           value="${entry.comment}"
                           placeholder="Optional comment">
                </td>
                <td>
                    <div class="wd-helper-actions">
                        <button class="wd-helper-btn-icon wd-helper-btn-remove" data-action="remove" data-index="${index}" title="Remove">−</button>
                        <button class="wd-helper-btn-icon wd-helper-btn-add" data-action="add" data-index="${index}" title="Add below">+</button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderAllEntries() {
        const tbody = document.getElementById('wd-entries-body');
        if (!tbody) return;

        tbody.innerHTML = timeEntries.map((entry, index) => renderEntryRow(index, entry)).join('');
        updateTotalHours();
    }

    function updateTotalHours() {
        let totalMinutes = 0;
        timeEntries.forEach(entry => {
            const mins = parseDuration(entry.duration);
            if (mins) totalMinutes += mins;
        });

        const totalEl = document.getElementById('wd-total-hours');
        if (totalEl) {
            totalEl.textContent = formatDuration(totalMinutes) || '0h';
        }

        // Check against workday total if set
        updateWorkdayValidation();
    }

    function calculateWorkdayMinutes() {
        const fromInput = document.getElementById('wd-workday-from');
        const toInput = document.getElementById('wd-workday-to');
        const breakInput = document.getElementById('wd-workday-break');

        if (!fromInput || !toInput) return null;

        const fromVal = fromInput.value.trim();
        const toVal = toInput.value.trim();

        if (!fromVal || !toVal) return null;

        const fromTime = parseTimeInput(fromVal);
        const toTime = parseTimeInput(toVal);

        if (!fromTime || !toTime) return null;

        // Convert HH:MM to minutes from midnight
        const fromParts = fromTime.split(':');
        const toParts = toTime.split(':');
        const fromMinutes = parseInt(fromParts[0]) * 60 + parseInt(fromParts[1]);
        const toMinutes = parseInt(toParts[0]) * 60 + parseInt(toParts[1]);

        let workMinutes = toMinutes - fromMinutes;

        // Subtract break
        const breakVal = breakInput?.value.trim();
        if (breakVal) {
            const breakMinutes = parseInt(breakVal) || 0;
            workMinutes -= breakMinutes;
        }

        return workMinutes > 0 ? workMinutes : null;
    }

    function updateWorkdayTotal() {
        const workdayMinutes = calculateWorkdayMinutes();
        const totalEl = document.getElementById('wd-workday-total');

        if (totalEl) {
            if (workdayMinutes) {
                totalEl.textContent = `= ${formatDuration(workdayMinutes)}`;
            } else {
                totalEl.textContent = '= 0h';
            }
        }

        updateWorkdayValidation();
    }

    function updateWorkdayValidation() {
        const workdayMinutes = calculateWorkdayMinutes();
        const totalEl = document.getElementById('wd-total-hours');
        const workdayTotalEl = document.getElementById('wd-workday-total');
        const remainingEl = document.getElementById('wd-remaining');

        // Calculate booking total
        let bookingMinutes = 0;
        timeEntries.forEach(entry => {
            const mins = parseDuration(entry.duration);
            if (mins) bookingMinutes += mins;
        });

        // If no workday time set, hide remaining and remove styling
        if (!workdayMinutes) {
            if (remainingEl) {
                remainingEl.textContent = '';
                remainingEl.classList.remove('done');
            }
            if (totalEl) {
                totalEl.classList.remove('wd-helper-mismatch', 'wd-helper-match');
            }
            return;
        }

        const diff = workdayMinutes - bookingMinutes;

        // Update remaining display
        if (remainingEl) {
            if (diff === 0) {
                remainingEl.textContent = 'Complete!';
                remainingEl.classList.add('done');
            } else if (diff > 0) {
                remainingEl.textContent = `${formatDuration(diff)} remaining`;
                remainingEl.classList.remove('done');
            } else {
                remainingEl.textContent = `${formatDuration(Math.abs(diff))} over`;
                remainingEl.classList.remove('done');
            }
        }

        // Compare and apply styling
        if (bookingMinutes === workdayMinutes) {
            if (totalEl) {
                totalEl.classList.remove('wd-helper-mismatch');
                totalEl.classList.add('wd-helper-match');
            }
            if (workdayTotalEl) {
                workdayTotalEl.classList.remove('wd-helper-mismatch');
                workdayTotalEl.classList.add('wd-helper-match');
            }
        } else {
            if (totalEl) {
                totalEl.classList.remove('wd-helper-match');
                totalEl.classList.add('wd-helper-mismatch');
            }
            if (workdayTotalEl) {
                workdayTotalEl.classList.remove('wd-helper-match');
                workdayTotalEl.classList.add('wd-helper-mismatch');
            }
        }
    }

    // Parse time input for workday (reuse the existing parseTimeInput)
    function parseTimeInput(input) {
        if (!input) return null;

        input = input.trim().toLowerCase();

        let hours = 0;
        let minutes = 0;

        // Format: HH:MM or H:MM
        if (input.includes(':')) {
            const parts = input.split(':');
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10) || 0;
        }
        // Format: HHMM (e.g., 0800, 1730)
        else if (input.length === 4 && !isNaN(input)) {
            hours = parseInt(input.slice(0, 2), 10);
            minutes = parseInt(input.slice(2, 4), 10);
        }
        // Format: HMM (e.g., 800 for 8:00)
        else if (input.length === 3 && !isNaN(input)) {
            hours = parseInt(input.slice(0, 1), 10);
            minutes = parseInt(input.slice(1, 3), 10);
        }
        // Format: HH or H (e.g., 08, 8, 17)
        else if (input.length <= 2 && !isNaN(input)) {
            hours = parseInt(input, 10);
            minutes = 0;
        }
        else {
            return null;
        }

        // Validate
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function showSuggestionsForInput(inputEl) {
        const query = inputEl.value.trim().toLowerCase();
        const index = inputEl.dataset.index;
        const suggestionsEl = document.querySelector(`.wd-helper-suggestions[data-index="${index}"]`);

        if (!suggestionsEl) return;

        if (!query || query.length < 1) {
            suggestionsEl.classList.remove('show');
            return;
        }

        const filtered = cachedProjects.filter(p =>
            p.id.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query)
        ).slice(0, 8);

        if (filtered.length === 0) {
            suggestionsEl.innerHTML = '<div class="wd-helper-suggestion" style="color: #888; cursor: default;">No matches</div>';
            suggestionsEl.classList.add('show');
            return;
        }

        suggestionsEl.innerHTML = filtered.map((p, idx) => `
            <div class="wd-helper-suggestion" data-id="${p.id}" data-idx="${idx}">
                <span class="wd-helper-suggestion-id">${p.id}</span>
                <span class="wd-helper-suggestion-name">${p.name}</span>
            </div>
        `).join('');

        suggestionsEl.classList.add('show');
    }

    function setStatus(message, type = 'info') {
        const statusEl = document.getElementById('wd-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'wd-helper-status ' + type;
        }
    }

    function setProgress(current, total, message) {
        const progressEl = document.getElementById('wd-progress');
        const textEl = document.getElementById('wd-progress-text');
        const fillEl = document.getElementById('wd-progress-fill');

        if (progressEl && textEl && fillEl) {
            progressEl.classList.add('show');
            textEl.textContent = message;
            fillEl.style.width = `${(current / total) * 100}%`;
        }
    }

    function hideProgress() {
        const progressEl = document.getElementById('wd-progress');
        if (progressEl) {
            progressEl.classList.remove('show');
        }
    }

    function moveDialogToCorner() {
        if (modalOverlay) {
            modalOverlay.classList.remove('centered');
        }
    }

    function moveDialogToCenter() {
        if (modalOverlay) {
            modalOverlay.classList.add('centered');
        }
    }

    function showLoadingOverlay(message) {
        const overlay = document.getElementById('wd-loading-overlay');
        const text = document.getElementById('wd-loading-text');
        if (overlay && text) {
            text.textContent = message || 'Loading...';
            overlay.style.display = 'flex';
        }
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById('wd-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    function updateLoadingText(message) {
        const text = document.getElementById('wd-loading-text');
        if (text) {
            text.textContent = message;
        }
    }

    function showActionRequired(dayNumber, entryNum, totalEntries) {
        const container = document.getElementById('wd-action-required');
        const dayEl = document.getElementById('wd-action-day');
        if (container && dayEl) {
            dayEl.textContent = dayNumber;
            container.style.display = 'block';
        }
        // Also update status
        setStatus(`Entry ${entryNum}/${totalEntries} - Waiting for you to click day ${dayNumber}...`, 'info');
    }

    function hideActionRequired() {
        const container = document.getElementById('wd-action-required');
        if (container) {
            container.style.display = 'none';
        }
    }

    // ==================== SINGLE ENTRY AUTOMATION ====================

    async function fillSingleTimeEntry(project, timeIn, timeOut, comment) {
        // Find and click Time Type input
        let timeTypeInput = document.querySelector('input[class*="InputContainer"]');
        if (!timeTypeInput) {
            timeTypeInput = document.querySelector('input[id$="-input"]');
        }

        if (!timeTypeInput) {
            throw new Error('Could not find Time Type input field');
        }

        simulateClick(timeTypeInput);
        await delay(300);

        // Click "Projects" option
        const projectsOption = await waitForElement('[id^="promptOption-"]', 'Projects', 3000);
        simulateClick(projectsOption);
        await delay(500);

        // Find project by scrolling
        const findProjectByScrolling = async (searchText) => {
            const firstOption = document.querySelector('[id^="promptOption-"]');
            if (!firstOption) return null;

            let scrollContainer = document.querySelector('ul.WGLO') || firstOption.closest('ul');
            if (!scrollContainer) {
                scrollContainer = firstOption.parentElement;
                while (scrollContainer && scrollContainer !== document.body) {
                    if (scrollContainer.scrollHeight > scrollContainer.clientHeight + 10) break;
                    scrollContainer = scrollContainer.parentElement;
                }
            }

            for (let i = 0; i < 30; i++) {
                const elements = document.querySelectorAll('[id^="promptOption-"]');
                for (const el of elements) {
                    if (el.textContent.includes(searchText)) return el;
                }

                const allOptions = document.querySelectorAll('[id^="promptOption-"]');
                if (allOptions.length > 0) {
                    allOptions[allOptions.length - 1].scrollIntoView({ behavior: 'instant', block: 'end' });
                }
                await delay(200);
            }
            return null;
        };

        const projectEntry = await findProjectByScrolling(project);
        if (!projectEntry) {
            throw new Error(`Could not find project: ${project}`);
        }

        const radioButton = projectEntry.querySelector('input[type="radio"]');
        if (radioButton) {
            simulateClick(radioButton);
        } else {
            simulateClick(projectEntry);
        }
        await delay(500);

        // Fill In time
        const allInputs = document.querySelectorAll('input[class*="gwt-TextBox"], input[class*="TextBox"]');
        if (allInputs.length >= 1) {
            const inInput = allInputs[0];
            inInput.focus();
            inInput.value = timeIn;
            inInput.dispatchEvent(new Event('input', { bubbles: true }));
            inInput.dispatchEvent(new Event('change', { bubbles: true }));
            inInput.dispatchEvent(new Event('blur', { bubbles: true }));
            await delay(300);
        }

        // Fill Out time
        if (allInputs.length >= 2) {
            const outInput = allInputs[1];
            outInput.focus();
            outInput.value = timeOut;
            outInput.dispatchEvent(new Event('input', { bubbles: true }));
            outInput.dispatchEvent(new Event('change', { bubbles: true }));
            outInput.dispatchEvent(new Event('blur', { bubbles: true }));
            await delay(300);
        }

        // Set Work Location to Office
        const allInputContainers = document.querySelectorAll('input[class*="InputContainer"]');
        let workLocationInput = null;

        for (const input of allInputContainers) {
            let parent = input.parentElement;
            for (let i = 0; i < 10 && parent; i++) {
                const text = parent.textContent || '';
                if (text.includes('Work Location') && !text.includes('Time Type')) {
                    workLocationInput = input;
                    break;
                }
                parent = parent.parentElement;
            }
            if (workLocationInput) break;
        }

        if (workLocationInput) {
            simulateClick(workLocationInput);
            await delay(500);

            try {
                const workLocationOption = await waitForElement('[id^="promptOption-"]', 'Work Location', 3000);
                simulateClick(workLocationOption);
                await delay(500);

                const officeOption = await waitForElement('[id^="promptOption-"]', 'Office', 3000);
                const radioBtn = officeOption.querySelector('input[type="radio"]');
                if (radioBtn) {
                    simulateClick(radioBtn);
                } else {
                    simulateClick(officeOption);
                }
                await delay(300);
            } catch (e) {
                console.log('Work Location selection error:', e);
            }
        }

        // Fill comment if provided
        if (comment) {
            const commentInput = document.querySelector('textarea[data-automation-id*="comment"], textarea');
            if (commentInput) {
                commentInput.focus();
                commentInput.value = comment;
                commentInput.dispatchEvent(new Event('input', { bubbles: true }));
                commentInput.dispatchEvent(new Event('change', { bubbles: true }));
                await delay(200);
            }
        }

        // Click OK
        const okButton = document.querySelector('button[data-automation-id="wd-CommandButton_uic_okButton"]') ||
                        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'OK');

        if (okButton) {
            simulateClick(okButton);
        }
    }

    // ==================== MULTI-ENTRY PROCESSING ====================

    async function processAllEntries() {
        // Validate entries
        const validEntries = timeEntries.filter(e => e.project && e.duration);

        if (validEntries.length === 0) {
            setStatus('Please add at least one entry with project and duration', 'error');
            return;
        }

        // Move dialog to corner so user can click on calendar
        moveDialogToCorner();

        // Get user's start time from the "From" field, default to 08:00
        const workdayFromInput = document.getElementById('wd-workday-from');
        let startHour = 8;
        let startMinute = 0;

        if (workdayFromInput && workdayFromInput.value.trim()) {
            const parsedStart = parseTimeInput(workdayFromInput.value.trim());
            if (parsedStart) {
                const parts = parsedStart.split(':');
                startHour = parseInt(parts[0], 10);
                startMinute = parseInt(parts[1], 10);
            }
        }

        // Calculate times with auto-break after 6 hours
        const BREAK_AFTER_MINUTES = 6 * 60; // 6 hours
        const BREAK_DURATION = 30; // 30 minutes

        let currentMinutes = startHour * 60 + startMinute; // Start from user's time (in absolute minutes)
        let workedMinutesSoFar = 0;
        let breakInserted = false;

        const entriesWithTimes = [];

        for (const entry of validEntries) {
            const durationMinutes = parseDuration(entry.duration);

            // Check if we have explicit start/end times from import
            if (entry.startTime && entry.endTime) {
                entriesWithTimes.push({
                    ...entry,
                    durationMinutes: parseDuration(entry.duration)
                });
                // Update currentMinutes to the end of this entry to keep sequence if needed
                if (entry.endTime.includes(':')) {
                    const parts = entry.endTime.split(':');
                    const hour = parseInt(parts[0], 10);
                    const minute = parseInt(parts[1], 10);
                    currentMinutes = hour * 60 + minute;
                }
                workedMinutesSoFar += durationMinutes;
                continue;
            }

            // Check if adding this entry would cross the 6-hour mark
            if (!breakInserted && workedMinutesSoFar + durationMinutes > BREAK_AFTER_MINUTES) {
                // Calculate how much time fits before the break
                const timeBeforeBreak = BREAK_AFTER_MINUTES - workedMinutesSoFar;

                if (timeBeforeBreak > 0 && timeBeforeBreak < durationMinutes) {
                    // Split this entry: part before break, then break, then part after
                    const startTime1 = minutesToTimeAbsolute(currentMinutes);
                    currentMinutes += timeBeforeBreak;
                    const endTime1 = minutesToTimeAbsolute(currentMinutes);

                    entriesWithTimes.push({
                        ...entry,
                        startTime: startTime1,
                        endTime: endTime1,
                        durationMinutes: timeBeforeBreak
                    });

                    workedMinutesSoFar += timeBeforeBreak;

                    // Add break gap
                    currentMinutes += BREAK_DURATION;
                    breakInserted = true;

                    // Continue with remaining time
                    const remainingDuration = durationMinutes - timeBeforeBreak;
                    const startTime2 = minutesToTimeAbsolute(currentMinutes);
                    currentMinutes += remainingDuration;
                    const endTime2 = minutesToTimeAbsolute(currentMinutes);

                    entriesWithTimes.push({
                        ...entry,
                        startTime: startTime2,
                        endTime: endTime2,
                        durationMinutes: remainingDuration
                    });

                    workedMinutesSoFar += remainingDuration;
                    continue;
                } else if (timeBeforeBreak <= 0) {
                    // Already at 6 hours exactly, insert break before this entry
                    currentMinutes += BREAK_DURATION;
                    breakInserted = true;
                }
            }

            // Normal entry (no split needed)
            const startTime = minutesToTimeAbsolute(currentMinutes);
            currentMinutes += durationMinutes;
            workedMinutesSoFar += durationMinutes;
            const endTime = minutesToTimeAbsolute(currentMinutes);

            entriesWithTimes.push({
                ...entry,
                startTime,
                endTime,
                durationMinutes
            });

            // If we just hit exactly 6 hours, insert break after
            if (!breakInserted && workedMinutesSoFar >= BREAK_AFTER_MINUTES) {
                currentMinutes += BREAK_DURATION;
                breakInserted = true;
            }
        }

        // Store the current day number from the dialog for reopening
        let currentDayNumber = null;

        // Try to get the day from the dialog date
        const dateFromDialog = getCurrentDateFromDialog();
        console.log('Date from dialog:', dateFromDialog);

        if (dateFromDialog && dateFromDialog !== 'Today') {
            // Extract day number from date like "08.01.2026" -> "8"
            const match = dateFromDialog.match(/^(\d{1,2})\./);
            if (match) {
                currentDayNumber = parseInt(match[1], 10).toString();
                console.log('Current day number from dialog:', currentDayNumber);
            }
        }

        // Fallback: use today's date
        if (!currentDayNumber) {
            currentDayNumber = new Date().getDate().toString();
            console.log('Using today as fallback:', currentDayNumber);
        }

        // Find the day number element to click in month view
        const findDayNumberElement = (dayNum) => {
            // Strategy 1: Find by data-automation-id="calendarDateLabel" with matching text
            // This is the actual clickable element
            const dateLabels = document.querySelectorAll('[data-automation-id="calendarDateLabel"]');
            for (const label of dateLabels) {
                if (label.textContent.trim() === dayNum) {
                    console.log('Found calendarDateLabel:', label);
                    return label;
                }
            }

            // Strategy 2: Find by data-automation-id="calendarDateCell-X-DAY"
            const dateCells = document.querySelectorAll('[data-automation-id^="calendarDateCell-"]');
            for (const cell of dateCells) {
                const automationId = cell.getAttribute('data-automation-id');
                const match = automationId.match(/calendarDateCell-\d+-(\d+)/);
                if (match && match[1] === dayNum) {
                    console.log('Found calendarDateCell:', cell);
                    return cell;
                }
            }

            // Strategy 3: Look for div elements with Label class containing the day number
            const labels = document.querySelectorAll('div[class*="Label"]');
            for (const label of labels) {
                const text = label.textContent.trim();
                if (text === dayNum) {
                    console.log('Found day label:', label);
                    return label;
                }
            }

            return null;
        };

        // Process each entry
        for (let i = 0; i < entriesWithTimes.length; i++) {
            const entry = entriesWithTimes[i];

            setProgress(i + 1, entriesWithTimes.length,
                `Processing ${i + 1}/${entriesWithTimes.length}: ${entry.project} (${entry.startTime} - ${entry.endTime})`);

            try {
                // Wait for dialog to be open (first entry should have it open, others need to reopen)
                if (i > 0) {
                    // Wait a bit for previous dialog to close
                    await delay(1000);

                    // Dismiss any toast notifications that might be blocking focus
                    const dismissToast = () => {
                        // Try various toast close buttons/elements
                        const toastClose = document.querySelector('[data-automation-id="toastCloseButton"]') ||
                                          document.querySelector('.wd-toast-close') ||
                                          document.querySelector('[aria-label="Close"]');
                        if (toastClose) {
                            toastClose.click();
                            console.log('Dismissed toast notification');
                            return true;
                        }
                        // Try clicking outside toast to dismiss
                        const toast = document.querySelector('[data-automation-id="toast"]') ||
                                     document.querySelector('.wd-toast') ||
                                     document.querySelector('[role="alert"]');
                        if (toast) {
                            // Click somewhere safe to dismiss
                            document.body.click();
                            console.log('Clicked body to dismiss toast');
                            return true;
                        }
                        return false;
                    };

                    dismissToast();
                    await delay(300);

                    // Try to automatically reopen dialog by focusing day and pressing Enter
                    const dayElement = findDayNumberElement(currentDayNumber);
                    let dialogOpened = false;

                    if (dayElement) {
                        console.log('Attempting to focus day element and press Enter...');
                        setStatus(`Opening dialog for day ${currentDayNumber}...`, 'info');

                        // Scroll element into view first
                        dayElement.scrollIntoView({ behavior: 'instant', block: 'center' });
                        await delay(100);

                        // The div might not be focusable - try to find a focusable parent or make it focusable
                        let focusTarget = dayElement;

                        // Check if element or parent has tabindex
                        if (!dayElement.hasAttribute('tabindex')) {
                            // Look for a focusable parent (button, link, or element with tabindex)
                            let parent = dayElement.parentElement;
                            let foundFocusable = false;
                            for (let i = 0; i < 5 && parent; i++) {
                                if (parent.hasAttribute('tabindex') ||
                                    parent.tagName === 'BUTTON' ||
                                    parent.tagName === 'A' ||
                                    parent.getAttribute('role') === 'button' ||
                                    parent.getAttribute('role') === 'gridcell') {
                                    focusTarget = parent;
                                    foundFocusable = true;
                                    console.log('Found focusable parent:', parent);
                                    break;
                                }
                                parent = parent.parentElement;
                            }

                            // If no focusable parent, make the element focusable
                            if (!foundFocusable) {
                                console.log('Making element focusable by setting tabindex');
                                dayElement.setAttribute('tabindex', '0');
                            }
                        }

                        // Disable Workday's accessibility focus trap temporarily
                        const accessibilityAnchor = document.getElementById('accessibilityInitialFocusAnchor');
                        let originalTabIndex = null;
                        if (accessibilityAnchor) {
                            originalTabIndex = accessibilityAnchor.getAttribute('tabindex');
                            accessibilityAnchor.setAttribute('tabindex', '-999');
                            accessibilityAnchor.blur();
                            console.log('Disabled accessibility anchor');
                        }

                        // Also blur any currently focused element
                        if (document.activeElement && document.activeElement !== document.body) {
                            document.activeElement.blur();
                        }
                        await delay(50);

                        // Focus the element (this is trusted)
                        focusTarget.focus();
                        await delay(150);

                        // Restore accessibility anchor
                        if (accessibilityAnchor && originalTabIndex !== null) {
                            accessibilityAnchor.setAttribute('tabindex', originalTabIndex);
                        }

                        // Check if we actually have focus
                        console.log('Focus target:', focusTarget);
                        console.log('Active element after focus:', document.activeElement);
                        console.log('Element focused:', document.activeElement === focusTarget || document.activeElement === dayElement);

                        // Dispatch Enter key event to the focused element
                        const targetEl = document.activeElement !== document.body ? document.activeElement : focusTarget;

                        const enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        targetEl.dispatchEvent(enterEvent);

                        // Also try keypress
                        const keypressEvent = new KeyboardEvent('keypress', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        targetEl.dispatchEvent(keypressEvent);

                        // Also try keyup
                        const enterUpEvent = new KeyboardEvent('keyup', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        targetEl.dispatchEvent(enterUpEvent);

                        // Wait briefly to see if dialog opens
                        try {
                            await waitForElement('input[class*="InputContainer"]', null, 2000);
                            console.log('Dialog opened automatically!');
                            dialogOpened = true;
                            await delay(500);
                        } catch (e) {
                            console.log('Auto-open did not work, falling back to manual');
                        }
                    }

                    // If auto-open didn't work, ask user to click
                    if (!dialogOpened) {
                        showActionRequired(currentDayNumber, i + 1, entriesWithTimes.length);

                        // Wait for user to click and dialog to open
                        try {
                            await waitForElement('input[class*="InputContainer"]', null, 60000); // 60 second timeout
                            console.log('Dialog opened by user click');
                            hideActionRequired();
                            await delay(500);
                        } catch (e) {
                            hideActionRequired();
                            throw new Error('Timeout waiting for dialog. Please click on the day number to open the time entry dialog.');
                        }
                    }
                }

                await fillSingleTimeEntry(entry.project, entry.startTime, entry.endTime, entry.comment);

                // Wait for dialog to close
                await waitForDialogClose();

            } catch (error) {
                setStatus(`Error on entry ${i + 1}: ${error.message}`, 'error');
                hideProgress();
                return;
            }
        }

        hideProgress();
        setStatus(`Successfully entered ${entriesWithTimes.length} time entries!`, 'success');

        // Close modal after delay
        await delay(2000);
        closeModal();
    }

    // ==================== MODAL MANAGEMENT ====================

    let modalOverlay = null;

    function openModal() {
        injectStyles();

        if (modalOverlay) {
            modalOverlay.remove();
        }

        // Reset entries for new session
        timeEntries = [{ project: '', duration: '', comment: '' }];

        modalOverlay = createMultiEntryModal();
        modalOverlay.classList.add('centered'); // Start centered for data entry
        document.body.appendChild(modalOverlay);

        renderAllEntries();

        const cancelBtn = document.getElementById('wd-cancel');
        const submitBtn = document.getElementById('wd-submit');
        const tbody = document.getElementById('wd-entries-body');
        const workdayFrom = document.getElementById('wd-workday-from');
        const workdayTo = document.getElementById('wd-workday-to');
        const workdayBreak = document.getElementById('wd-workday-break');

        const importBtn = document.getElementById('wd-import-clipboard');

        cancelBtn.addEventListener('click', closeModal);
        if (importBtn) {
            importBtn.addEventListener('click', importFromClipboard);
        }

        // Workday time inputs - update total when changed
        [workdayFrom, workdayTo, workdayBreak].forEach(input => {
            if (input) {
                input.addEventListener('input', updateWorkdayTotal);
            }
        });

        submitBtn.addEventListener('click', () => {
            // Validate against workday time if set
            const workdayMinutes = calculateWorkdayMinutes();
            if (workdayMinutes) {
                let bookingMinutes = 0;
                timeEntries.forEach(entry => {
                    const mins = parseDuration(entry.duration);
                    if (mins) bookingMinutes += mins;
                });

                if (bookingMinutes !== workdayMinutes) {
                    const diff = workdayMinutes - bookingMinutes;
                    const diffStr = formatDuration(Math.abs(diff));
                    if (diff > 0) {
                        setStatus(`Time mismatch: ${diffStr} still needs to be distributed`, 'error');
                    } else {
                        setStatus(`Time mismatch: ${diffStr} over the daily work time`, 'error');
                    }
                    return;
                }
            }
            processAllEntries();
        });

        // Event delegation for dynamic elements
        tbody.addEventListener('input', (e) => {
            const input = e.target;
            if (!input.dataset.field) return;

            const index = parseInt(input.dataset.index, 10);
            const field = input.dataset.field;
            timeEntries[index][field] = input.value;

            if (field === 'project') {
                showSuggestionsForInput(input);
            }

            if (field === 'duration') {
                updateTotalHours();
            }
        });

        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const index = parseInt(btn.dataset.index, 10);

            if (action === 'add') {
                timeEntries.splice(index + 1, 0, { project: '', duration: '', comment: '' });
                renderAllEntries();
            } else if (action === 'remove') {
                if (timeEntries.length > 1) {
                    timeEntries.splice(index, 1);
                    renderAllEntries();
                }
            }
        });

        // Handle suggestion clicks
        tbody.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.wd-helper-suggestion');
            if (!suggestion || !suggestion.dataset.id) return;

            const suggestionsEl = suggestion.parentElement;
            const index = suggestionsEl.dataset.index;
            const input = tbody.querySelector(`input[data-field="project"][data-index="${index}"]`);

            if (input) {
                input.value = suggestion.dataset.id;
                timeEntries[index].project = suggestion.dataset.id;
                suggestionsEl.classList.remove('show');
            }
        });

        // Hide suggestions on blur
        tbody.addEventListener('focusout', (e) => {
            if (e.target.dataset.field === 'project') {
                setTimeout(() => {
                    const suggestions = document.querySelectorAll('.wd-helper-suggestions');
                    suggestions.forEach(s => s.classList.remove('show'));
                }, 200);
            }
        });

        // Keyboard navigation
        modalOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Click outside to close
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Auto-load projects
        if (!projectsFetched && cachedProjects.length === 0 && !projectsLoading) {
            setTimeout(async () => {
                showLoadingOverlay('Loading projects... Please wait');
                await fetchProjectsFromWorkday((msg) => updateLoadingText(msg));
                hideLoadingOverlay();
            }, 200);
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.remove();
            modalOverlay = null;
        }
    }

    async function importFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                setStatus('Clipboard does not contain valid JSON', 'error');
                return;
            }

            if (!Array.isArray(data)) {
                setStatus('Clipboard data is not a list', 'error');
                return;
            }

            // Map fields
            const newEntries = data.map(item => ({
                project: item.project || '',
                duration: item.duration || (item.startTime && item.endTime ? formatDuration(calculateMinutesDiff(item.startTime, item.endTime)) : ''),
                comment: item.comment || '',
                startTime: item.startTime, // Store explicit times
                endTime: item.endTime
            }));

            // Replace entries
            timeEntries = newEntries;
            renderAllEntries();
            setStatus(`Imported ${newEntries.length} entries. Please verify duration.`, 'success');

        } catch (err) {
            console.error(err);
            setStatus('Error importing: ' + err.message, 'error');
        }
    }

    function calculateMinutesDiff(start, end) {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    }

    // ==================== KEYBOARD SHORTCUT ====================

    document.addEventListener('keydown', (e) => {
        // Only trigger on 't' key without modifiers, and not when typing in an input
        if (e.key === 't' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
            const tagName = document.activeElement?.tagName?.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || document.activeElement?.isContentEditable) {
                return; // Don't trigger when typing in inputs
            }
            e.preventDefault();
            openModal();
        }
    });

    console.log('Workday Time Entry Helper v2.1 loaded. Press T to open.');

})();
