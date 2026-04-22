/**
 * Modern K6 HTML Reporter with Modern UI
 * 
 * This module generates beautiful, modern HTML reports for k6 performance tests.
 * Features include:
 * - Responsive design with gradient UI
 * - Interactive tabs for different sections
 * - Visual charts and progress bars
 * - Detailed metrics, checks, and threshold reporting
 * - Support for custom test information
 */

/**
 * Main entry point for generating HTML reports
 * 
 * @param {Object} data - The k6 test results data object containing metrics, checks, thresholds, etc.
 * @param {Object} options - Configuration options for the report
 * @param {string} options.title - Main title for the report (defaults to current timestamp)
 * @param {string} options.subtitle - Subtitle or endpoint description
 * @param {string} options.httpMethod - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.additionalInfo - Key-value pairs of additional test information to display
 * @param {boolean} options.debug - If true, logs the raw k6 data to console
 * @returns {string} Complete HTML document as a string
 */
export function htmlReport(data, options = {}) {
    // Extract options with default values
    const title = options.title || new Date().toISOString().slice(0, 16).replace("T", " ");
    const subtitle = options.subtitle || '';
    const httpMethod = options.httpMethod || '';
    const additionalInfo = options.additionalInfo || {};
    const customSections = options.customSections || [];
    const consoleErrorLog = options.consoleErrorLog || [];
    const configuredThresholds = options.configuredThresholds || {};
    const debug = options.debug || false;

    console.log("[k6-html-reporter] Generating HTML summary report");

    // Debug mode: print raw k6 data to console for troubleshooting
    if (debug) {
        console.log(JSON.stringify(data, null, 2));
    }

    // Calculate summary statistics from k6 metrics data
    const stats = calculateStats(data);
    
    // Generate and return the complete HTML report
    return generateModernHTML(data, title, subtitle, httpMethod, additionalInfo, customSections, stats, consoleErrorLog, configuredThresholds);
}

/**
 * Generates the complete HTML document structure
 * 
 * @param {Object} data - The k6 test results data
 * @param {string} title - Report title
 * @param {string} subtitle - Report subtitle/endpoint
 * @param {string} httpMethod - HTTP method for the API call
 * @param {Object} additionalInfo - Additional test configuration info
 * @param {Array} customSections - Custom tab sections [{id, title, icon, content}]
 * @param {Object} stats - Pre-calculated statistics
 * @returns {string} Complete HTML document
 */
function generateModernHTML(data, title, subtitle, httpMethod, additionalInfo, customSections, stats, consoleErrorLog, configuredThresholds) {
    // Determine overall test status (pass/fail) based on errors, check failures, and threshold failures
    const testStatus = stats.failedRequests === 0 && stats.checkFailures === 0 && stats.thresholdFailures === 0;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Performance Test Report - ${escapeHtml(title)}</title>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* ========================================
           GLOBAL STYLES
           ======================================== */
        
        /* Reset default browser styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Main body styling with gradient background */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
        }

        /* Main container — full width with side padding */
        .container {
            margin: 0 24px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        /* ========================================
           HEADER SECTION
           ======================================== */
        
        /* Header with dynamic gradient based on test pass/fail status */
        .header {
            background: ${testStatus ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'};
            color: white;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }

        /* Animated background effect in header */
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 15s ease-in-out infinite;
        }

        /* Pulse animation for header background */
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        /* Header content positioned above the animated background */
        .header-content {
            position: relative;
            z-index: 10;
        }

        /* Main heading with flexbox for logo alignment */
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        /* K6 logo container */
        .k6-logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
        }

        /* Test status badge (PASSED/FAILED) */
        .test-status {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 50px;
            font-size: 0.9em;
            font-weight: 600;
            margin-top: 15px;
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }

        /* ========================================
           STATS GRID SECTION
           ======================================== */
        
        /* Responsive grid for statistic cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            padding: 40px;
            background: #f8f9fa;
        }

        /* Individual stat card with shadow and hover effects */
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        /* Colored top border for each stat card */
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        /* Hover effect: lift the card */
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        /* Success state: green gradient */
        .stat-card.success::before {
            background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
        }

        /* Error state: red gradient */
        .stat-card.error::before {
            background: linear-gradient(90deg, #eb3349 0%, #f45c43 100%);
        }

        /* Warning state: yellow/orange gradient */
        .stat-card.warning::before {
            background: linear-gradient(90deg, #f2994a 0%, #f2c94c 100%);
        }

        /* Background icon for stat cards (low opacity) */
        .stat-icon {
            font-size: 3em;
            opacity: 0.1;
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }

        /* Label text for each statistic */
        .stat-label {
            font-size: 0.85em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        /* Main value display for each statistic */
        .stat-value {
            font-size: 2.5em;
            font-weight: 700;
            color: #2c3e50;
            position: relative;
            z-index: 10;
        }

        /* Subtext below the main stat value */
        .stat-subtext {
            font-size: 0.9em;
            color: #95a5a6;
            margin-top: 8px;
        }

        /* ========================================
           TABS SECTION
           ======================================== */
        
        /* Container for all tab content */
        .tabs-container {
            padding: 40px;
        }

        /* Tab button container with bottom border — single row */
        .tabs {
            display: flex;
            gap: 4px;
            border-bottom: 2px solid #e9ecef;
            margin-bottom: 30px;
            flex-wrap: nowrap;
            overflow-x: auto;
        }

        /* Individual tab button styling — compact to fit one row */
        .tab-button {
            padding: 12px 18px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
            color: #6c757d;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        /* Tab button hover state */
        .tab-button:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
        }

        /* Active tab styling */
        .tab-button.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }

        /* Tab content panel (hidden by default) */
        .tab-content {
            display: none;
            animation: fadeIn 0.5s ease;
        }

        /* Show active tab content */
        .tab-content.active {
            display: block;
        }

        /* Fade-in animation for tab content */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ========================================
           METRICS TABLE
           ======================================== */
        
        /* Main metrics table with rounded corners */
        .metrics-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        /* Table header with gradient background */
        .metrics-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        /* Table header cells */
        .metrics-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Table data cells */
        .metrics-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }

        /* Table row hover effect */
        .metrics-table tbody tr {
            transition: background 0.2s ease;
        }

        .metrics-table tbody tr:hover {
            background: #f8f9fa;
        }

        /* Remove border from last row */
        .metrics-table tbody tr:last-child td {
            border-bottom: none;
        }

        /* ========================================
           BADGES AND INDICATORS
           ======================================== */
        
        /* Generic badge styling */
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }

        /* Success badge (green) */
        .badge-success {
            background: #d4edda;
            color: #155724;
        }

        /* Error badge (red) */
        .badge-error {
            background: #f8d7da;
            color: #721c24;
        }

        /* Warning badge (yellow) */
        .badge-warning {
            background: #fff3cd;
            color: #856404;
        }

        /* Good metric value (green text) */
        .metric-value-good {
            color: #28a745;
            font-weight: 600;
        }

        /* Bad metric value (red text) */
        .metric-value-bad {
            color: #dc3545;
            font-weight: 600;
        }

        /* ========================================
           CHART AND CONTAINER STYLES
           ======================================== */
        
        /* Container for charts and content sections */
        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        /* Chart section title */
        .chart-title {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
        }

        /* Progress bar container */
        .progress-bar {
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
            position: relative;
        }

        /* Progress bar fill with animation */
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            color: white;
            font-weight: 600;
            transition: width 1s ease;
        }

        /* Error state for progress bar (red gradient) */
        .progress-fill.error {
            background: linear-gradient(90deg, #eb3349 0%, #f45c43 100%);
        }

        /* ========================================
           FOOTER
           ======================================== */
        
        /* Footer section */
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 0.9em;
        }

        /* Footer links */
        .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        /* ========================================
           RESPONSIVE DESIGN
           ======================================== */
        
        /* Mobile/tablet optimizations */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                padding: 20px;
            }

            .tabs-container {
                padding: 20px;
            }

            .tab-button {
                font-size: 0.9em;
                padding: 12px 20px;
            }
        }

        /* ========================================
           CHECK ITEMS
           ======================================== */
        
        /* Individual check result item */
        .check-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .check-item:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        /* Check name/description */
        .check-name {
            flex: 1;
            font-weight: 500;
        }

        /* Container for check statistics */
        .check-stats {
            display: flex;
            gap: 20px;
        }

        /* ========================================
           HEADER SUBTITLE AND METHOD BADGES
           ======================================== */
        
        /* Subtitle display in header */
        .header-subtitle {
            font-size: 1.1em;
            opacity: 0.85;
            margin: 15px 0 10px 0;
            font-family: 'Courier New', monospace;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
        }

        /* HTTP method badge (GET, POST, etc.) */
        .http-method-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.9em;
            margin-right: 10px;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
        }

        /* Color coding for different HTTP methods */
        .method-GET {
            background: #28a745;
            color: white;
        }

        .method-POST {
            background: #007bff;
            color: white;
        }

        .method-PUT {
            background: #ffc107;
            color: #000;
        }

        .method-DELETE {
            background: #dc3545;
            color: white;
        }

        .method-PATCH {
            background: #17a2b8;
            color: white;
        }

        /* ========================================
           INFO TABLE
           ======================================== */
        
        /* Table for displaying test information */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        /* Info table cells */
        .info-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #e9ecef;
        }

        /* Info table labels (left column) */
        .info-table td:first-child {
            font-weight: 600;
            color: #667eea;
            width: 40%;
        }

        /* Info table values (right column) */
        .info-table td:last-child {
            color: #2c3e50;
            font-family: 'Courier New', monospace;
        }

        /* Remove border from last row */
        .info-table tr:last-child td {
            border-bottom: none;
        }

        /* Row hover effect */
        .info-table tr:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- ========================================
             HEADER SECTION
             ======================================== -->
        <div class="header">
            <div class="header-content">
                <h1>
                    <!-- K6 Logo SVG -->
                    <div class="k6-logo">
                        <svg width="40" height="36" viewBox="0 0 50 45" fill="white">
                            <path d="M31.968 34.681a2.007 2.007 0 002.011-2.003c0-1.106-.9-2.003-2.011-2.003a2.007 2.007 0 00-2.012 2.003c0 1.106.9 2.003 2.012 2.003z"/>
                            <path d="M39.575 0L27.154 16.883 16.729 9.31 0 45h50L39.575 0zM23.663 37.17l-2.97-4.072v4.072h-2.751V22.038l2.75 1.989v7.66l3.659-5.014 2.086 1.51-3.071 4.21 3.486 4.776h-3.189v.001zm8.305.17c-2.586 0-4.681-2.088-4.681-4.662 0-1.025.332-1.972.896-2.743l4.695-6.435 2.086 1.51-2.239 3.07a4.667 4.667 0 013.924 4.6c0 2.572-2.095 4.66-4.681 4.66z"/>
                        </svg>
                    </div>
                    K6 Performance Test Report
                </h1>
                <!-- Report title -->
                <p style="font-size: 1.2em; opacity: 0.9; margin: 10px 0;">${escapeHtml(title)}</p>
                <!-- Subtitle with HTTP method badge if provided -->
                ${subtitle ? `
                <div class="header-subtitle">
                    ${httpMethod ? `<span class="http-method-badge method-${httpMethod}">${httpMethod}</span>` : '<i class="fas fa-link"></i>'}
                    ${escapeHtml(subtitle)}
                </div>
                <span class="test-status" style="margin-top: 15px;">
                    ${testStatus ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}
                </span>
                ` : `
                <span class="test-status">
                    ${testStatus ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}
                </span>
                `}
                <!-- Timestamp when report was generated -->
                <p style="margin-top: 15px; opacity: 0.9;">
                    <i class="far fa-clock"></i> Generated: ${new Date().toLocaleString()}
                </p>
            </div>
        </div>

        <!-- ========================================
             STATS GRID - Overview Cards
             ======================================== -->
        <div class="stats-grid">
            <!-- Total Requests Card -->
            <div class="stat-card ${stats.failedRequests === 0 ? 'success' : 'error'}">
                <i class="fas fa-globe stat-icon"></i>
                <div class="stat-label">Total Requests</div>
                <div class="stat-value">${stats.totalRequests.toLocaleString()}</div>
                <div class="stat-subtext">${stats.successfulRequests.toLocaleString()} successful</div>
            </div>

            <!-- Success Rate Card -->
            <div class="stat-card ${stats.errorRate > 0 ? 'error' : 'success'}">
                <i class="fas fa-chart-line stat-icon"></i>
                <div class="stat-label">Success Rate</div>
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-subtext">${stats.failedRequests} failed requests</div>
            </div>

            <!-- Average Response Time Card -->
            <div class="stat-card ${parseFloat(stats.avgResponseTime) > 1000 ? 'warning' : 'success'}">
                <i class="fas fa-tachometer-alt stat-icon"></i>
                <div class="stat-label">Avg Response Time</div>
                <div class="stat-value">${stats.avgResponseTime}<span style="font-size: 0.5em;">ms</span></div>
                <div class="stat-subtext">P95: ${stats.p95ResponseTime}ms</div>
            </div>

            <!-- Virtual Users Card -->
            <div class="stat-card">
                <i class="fas fa-users stat-icon"></i>
                <div class="stat-label">Virtual Users</div>
                <div class="stat-value">${stats.maxVUs}</div>
                <div class="stat-subtext">Average: ${stats.avgVUs} VUs</div>
            </div>

            <!-- Checks Card -->
            <div class="stat-card ${stats.checkFailures > 0 ? 'error' : 'success'}">
                <i class="fas fa-check-circle stat-icon"></i>
                <div class="stat-label">Checks</div>
                <div class="stat-value">${stats.totalChecks}</div>
                <div class="stat-subtext">${stats.checkPasses} passed / ${stats.checkFailures} failed</div>
            </div>

            <!-- Thresholds Card -->
            <div class="stat-card ${stats.thresholdFailures > 0 ? 'error' : 'success'}">
                <i class="fas fa-exclamation-triangle stat-icon"></i>
                <div class="stat-label">Thresholds</div>
                <div class="stat-value">${stats.thresholdFailures}</div>
                <div class="stat-subtext">of ${stats.thresholdCount} breached</div>
            </div>
        </div>

        <!-- ========================================
             TABS SECTION
             ======================================== -->
        <div class="tabs-container">
            <!-- Tab Navigation Buttons -->
            <div class="tabs">
                <button class="tab-button active" onclick="switchTab(event, 'overview')">
                    <i class="fas fa-chart-pie"></i> Overview
                </button>
                <button class="tab-button" onclick="switchTab(event, 'metrics')">
                    <i class="fas fa-table"></i> Detailed Metrics
                </button>
                <button class="tab-button" onclick="switchTab(event, 'checks')">
                    <i class="fas fa-tasks"></i> Checks & Groups
                </button>
                <button class="tab-button" onclick="switchTab(event, 'thresholds')">
                    <i class="fas fa-gauge-high"></i> Thresholds
                </button>
                <!-- Custom section tabs -->
                ${customSections.map(s => `
                <button class="tab-button" onclick="switchTab(event, '${s.id}')">
                    ${s.icon ? `<i class="fas fa-${s.icon}"></i>` : ''} ${escapeHtml(s.title)}
                </button>
                `).join('')}
                <!-- Conditional Test Info tab (only if additional info provided) -->
                ${Object.keys(additionalInfo).length > 0 ? `
                <button class="tab-button" onclick="switchTab(event, 'testinfo')">
                    <i class="fas fa-info-circle"></i> Test Info
                </button>
                ` : ''}
            </div>

            <!-- Tab Content Panels -->
            
            <!-- Overview Tab - Charts and graphs -->
            <div id="overview" class="tab-content active">
                ${generateOverviewSection(stats)}
            </div>

            <!-- Metrics Tab - Detailed metrics table -->
            <div id="metrics" class="tab-content">
                ${generateMetricsTable(data)}
            </div>

            <!-- Checks Tab - Test checks and validations -->
            <div id="checks" class="tab-content">
                ${generateChecksSection(data)}
            </div>

            <!-- Thresholds Tab - Threshold pass/fail status -->
            <div id="thresholds" class="tab-content">
                ${generateThresholdsSection(data, consoleErrorLog, configuredThresholds)}
            </div>

            <!-- Custom section content panels -->
            ${customSections.map(s => `
            <div id="${s.id}" class="tab-content">
                ${s.content}
            </div>
            `).join('')}

            <!-- Test Info Tab - Additional configuration details -->
            ${Object.keys(additionalInfo).length > 0 ? `
            <div id="testinfo" class="tab-content">
                ${generateTestInfoSection(additionalInfo)}
            </div>
            ` : ''}
        </div>

        <!-- ========================================
             FOOTER
             ======================================== -->
        <div class="footer">
            <p>Generated by K6 Performance Testing Suite</p>
        </div>
    </div>

    <!-- ========================================
         JAVASCRIPT - Tab Switching & Animations
         ======================================== -->
    <script>
        /**
         * Switch between tabs when clicking tab buttons
         * @param {Event} event - The click event
         * @param {string} tabId - The ID of the tab to show
         */
        function switchTab(event, tabId) {
            // Remove active class from all tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            // Hide all tab content panels
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            event.currentTarget.classList.add('active');
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
        }

        /**
         * Animate progress bars on page load
         * Progress bars start at 0 width and animate to their final width
         */
        window.addEventListener('load', () => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.style.width; // Store final width
                bar.style.width = '0';         // Start at 0
                setTimeout(() => { bar.style.width = width; }, 100); // Animate to final width
            });
        });
    </script>
</body>
</html>`;
}

/**
 * Calculate summary statistics from k6 test data
 * Processes metrics, checks, and thresholds to generate summary numbers
 * 
 * @param {Object} data - The k6 test results data object
 * @returns {Object} Object containing calculated statistics
 */
function calculateStats(data) {
    // Initialize stats object with default values
    const stats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        errorRate: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        thresholdFailures: 0,
        thresholdCount: 0,
        checkFailures: 0,
        checkPasses: 0,
        totalChecks: 0,
        maxVUs: 0,
        avgVUs: 0,
        iterations: 0,
        dataReceived: 0,
        dataSent: 0,
        testDuration: 0
    };

    // Extract HTTP request count
    if (data.metrics.http_reqs) {
        stats.totalRequests = data.metrics.http_reqs.values.count || 0;
    }

    // Calculate success/failure rates
    if (data.metrics.http_req_failed) {
        stats.failedRequests = Math.round((data.metrics.http_req_failed.values.rate || 0) * stats.totalRequests);
        stats.successfulRequests = stats.totalRequests - stats.failedRequests;
        stats.errorRate = ((data.metrics.http_req_failed.values.rate || 0) * 100).toFixed(2);
        stats.successRate = (100 - stats.errorRate).toFixed(2);
    }

    // Extract response time metrics (avg, p95, min, max)
    if (data.metrics.http_req_duration) {
        const duration = data.metrics.http_req_duration.values;
        stats.avgResponseTime = (duration.avg || 0).toFixed(2);
        stats.p95ResponseTime = (duration['p(95)'] || 0).toFixed(2);
        stats.maxResponseTime = (duration.max || 0).toFixed(2);
        stats.minResponseTime = (duration.min || 0).toFixed(2);
    }

    // Extract Virtual User (VU) metrics
    if (data.metrics.vus) {
        stats.maxVUs = data.metrics.vus.values.max || 0;
        stats.avgVUs = (data.metrics.vus.values.avg || 0).toFixed(0);
    }

    // Extract iteration count
    if (data.metrics.iterations) {
        stats.iterations = data.metrics.iterations.values.count || 0;
    }

    // Extract data transfer metrics (convert bytes to megabytes)
    if (data.metrics.data_received) {
        stats.dataReceived = (data.metrics.data_received.values.count / 1000000).toFixed(2);
    }
    if (data.metrics.data_sent) {
        stats.dataSent = (data.metrics.data_sent.values.count / 1000000).toFixed(2);
    }

    // Count threshold failures across all metrics
    for (let metricName in data.metrics) {
        if (data.metrics[metricName].thresholds) {
            stats.thresholdCount++;
            const thresholds = data.metrics[metricName].thresholds;
            for (let thres in thresholds) {
                if (!thresholds[thres].ok) {
                    stats.thresholdFailures++;
                }
            }
        }
    }

    // Count check passes and failures from root group
    if (data.root_group) {
        const { passes, fails } = countGroupChecks(data.root_group);
        stats.checkPasses += passes;
        stats.checkFailures += fails;
    }

    stats.totalChecks = stats.checkPasses + stats.checkFailures;

    return stats;
}

/**
 * Count total passes and fails from an array of checks
 * 
 * @param {Array} checks - Array of check objects
 * @returns {Object} Object with passes and fails counts
 */
function countChecks(checks) {
    let passes = 0;
    let fails = 0;
    for (let check of checks) {
        passes += parseInt(check.passes || 0);
        fails += parseInt(check.fails || 0);
    }
    return { passes, fails };
}

/**
 * Recursively count checks from a group and all nested sub-groups
 * 
 * @param {Object} group - A k6 group object
 * @returns {Object} Object with passes and fails counts
 */
function countGroupChecks(group) {
    let passes = 0;
    let fails = 0;

    if (group.checks) {
        const result = countChecks(group.checks);
        passes += result.passes;
        fails += result.fails;
    }

    for (const subGroup of group.groups || []) {
        const result = countGroupChecks(subGroup);
        passes += result.passes;
        fails += result.fails;
    }

    return { passes, fails };
}

/**
 * Generate the metrics table HTML for detailed HTTP metrics
 * Shows timing breakdowns like duration, waiting, connecting, etc.
 * 
 * @param {Object} data - The k6 test results data
 * @returns {string} HTML string for the metrics table
 */
function generateMetricsTable(data) {
    // List of standard k6 HTTP timing metrics to display
    const standardMetrics = [
        'http_req_duration',
        'http_req_waiting',
        'http_req_connecting',
        'http_req_tls_handshaking',
        'http_req_sending',
        'http_req_receiving',
        'http_req_blocked',
        'iteration_duration',
    ];

    let html = '<div class="chart-container"><h3 class="chart-title">HTTP Request Metrics</h3>';
    html += '<table class="metrics-table"><thead><tr>';
    html += '<th>Metric</th><th>Avg</th><th>Min</th><th>Med</th><th>Max</th><th>P90</th><th>P95</th>';
    html += '</tr></thead><tbody>';

    // Generate table row for each metric
    for (let metricName of standardMetrics) {
        if (data.metrics[metricName]) {
            const metric = data.metrics[metricName];
            const values = metric.values;
            
            html += '<tr>';
            html += `<td><strong>${metricName}</strong></td>`;
            html += `<td>${(values.avg || 0).toFixed(2)}</td>`;
            html += `<td class="metric-value-good">${(values.min || 0).toFixed(2)}</td>`;
            html += `<td>${(values.med || 0).toFixed(2)}</td>`;
            html += `<td class="metric-value-bad">${(values.max || 0).toFixed(2)}</td>`;
            html += `<td>${(values['p(90)'] || 0).toFixed(2)}</td>`;
            html += `<td>${(values['p(95)'] || 0).toFixed(2)}</td>`;
            html += '</tr>';
        }
    }

    html += '</tbody></table></div>';
    html += '<p style="margin-top: 10px; color: #6c757d; font-size: 0.9em;"><i class="fas fa-info-circle"></i> All times are in milliseconds</p>';

    return html;
}

/**
 * Generate the checks section HTML
 * Displays all test checks organized by groups
 * 
 * @param {Object} data - The k6 test results data
 * @returns {string} HTML string for the checks section
 */
function generateChecksSection(data) {
    let html = '';

    // Process checks from all groups
    if (data.root_group.groups && data.root_group.groups.length > 0) {
        for (let group of data.root_group.groups) {
            html += `<div class="chart-container">`;
            html += `<h3 class="chart-title"><i class="fas fa-layer-group"></i> Group: ${escapeHtml(group.name)}</h3>`;
            
            // Display each check in the group
            if (group.checks && group.checks.length > 0) {
                for (let check of group.checks) {
                    const isPassed = check.fails === 0;
                    html += `<div class="check-item">`;
                    html += `<div class="check-name">${escapeHtml(check.name)}</div>`;
                    html += `<div class="check-stats">`;
                    html += `<span class="badge badge-success"><i class="fas fa-check"></i> ${check.passes} passed</span>`;
                    if (check.fails > 0) {
                        html += `<span class="badge badge-error"><i class="fas fa-times"></i> ${check.fails} failed</span>`;
                    }
                    html += `</div></div>`;
                }
            } else {
                html += `<p style="color: #6c757d;">No checks in this group</p>`;
            }
            
            html += `</div>`;
        }
    }

    // Process checks from root group (ungrouped checks)
    if (data.root_group.checks && data.root_group.checks.length > 0) {
        html += `<div class="chart-container">`;
        html += `<h3 class="chart-title"><i class="fas fa-list-check"></i> Other Checks</h3>`;
        
        for (let check of data.root_group.checks) {
            html += `<div class="check-item">`;
            html += `<div class="check-name">${escapeHtml(check.name)}</div>`;
            html += `<div class="check-stats">`;
            html += `<span class="badge badge-success"><i class="fas fa-check"></i> ${check.passes} passed</span>`;
            if (check.fails > 0) {
                html += `<span class="badge badge-error"><i class="fas fa-times"></i> ${check.fails} failed</span>`;
            }
            html += `</div></div>`;
        }
        
        html += `</div>`;
    }

    // Show message if no checks were configured
    if (!html) {
        html = '<div class="chart-container"><p style="color: #6c757d;">No checks configured for this test</p></div>';
    }

    return html;
}

/**
 * Evaluate a threshold rule against a metric's values.
 * Supports: p(N)<V, avg<V, min<V, max<V, med<V, count<V, rate<V
 * Returns true if passed, false if failed, null if can't evaluate.
 */
function evaluateThreshold(rule, metric) {
    if (!metric || !metric.values) return null;
    const match = rule.match(/^(\w+(?:\(\d+\))?)\s*([<>!=]+)\s*([\d.]+)$/);
    if (!match) return null;
    const [, stat, op, valStr] = match;
    const threshold = parseFloat(valStr);
    const actual = metric.values[stat];
    if (actual === undefined || actual === null) return null;
    switch (op) {
        case '<': return actual < threshold;
        case '<=': return actual <= threshold;
        case '>': return actual > threshold;
        case '>=': return actual >= threshold;
        case '==': return actual === threshold;
        case '!=': return actual !== threshold;
        default: return null;
    }
}

/**
 * Build HTML for a single threshold item.
 */
function buildThresholdItem(metricName, thresholdName, isPassed, metric, consoleErrorLog, timeoutEntries, errorEntries) {
    // isPassed can be true, false, or null (no data)
    const color = isPassed === null ? '#6c757d' : isPassed ? '#28a745' : '#dc3545';
    const icon = isPassed === null ? 'question-circle' : isPassed ? 'check-circle' : 'times-circle';
    const badgeClass = isPassed === null ? 'badge-warning' : isPassed ? 'badge-success' : 'badge-error';
    const label = isPassed === null ? 'NO DATA' : isPassed ? 'PASSED' : 'FAILED';

    const isConsoleErrors = metricName === 'wf_console_errors';
    const isConsoleTimeouts = metricName === 'wf_console_timeouts';
    const entries = isConsoleErrors ? errorEntries : isConsoleTimeouts ? timeoutEntries : [];
    const hasEntries = entries.length > 0;

    // Show actual metric value next to threshold rule
    let actualValue = '';
    if (metric && metric.values) {
        const match = thresholdName.match(/^(\w+(?:\(\d+\))?)/);
        if (match) {
            const stat = match[1];
            const val = metric.values[stat];
            if (val !== undefined && val !== null) {
                actualValue = ` (actual: ${typeof val === 'number' ? val.toFixed(2) : val})`;
            }
        }
    }

    let html = `<div class="check-item" style="border-left: 4px solid ${color}; flex-direction: column; align-items: stretch;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: center;">`;
    html += `<div style="flex: 1;">`;
    html += `<div style="font-weight: 600; margin-bottom: 5px;">`;
    html += `<i class="fas fa-${icon}" style="color: ${color};"></i> ${escapeHtml(metricName)}`;
    html += `</div>`;
    html += `<div style="color: #6c757d; font-size: 0.9em; font-family: monospace;">${escapeHtml(thresholdName)}${actualValue}</div>`;
    html += `</div>`;
    html += `<div class="check-stats"><span class="badge ${badgeClass}"><i class="fas fa-${isPassed === null ? 'question' : isPassed ? 'check' : 'times'}"></i> ${label}</span></div>`;
    html += `</div>`;

    // Expandable console errors/timeouts
    if (hasEntries) {
        html += `<details style="margin-top: 10px;">`;
        html += `<summary style="cursor: pointer; color: #667eea; font-weight: 500; font-size: 0.9em; user-select: none;">`;
        html += `<i class="fas fa-list"></i> View ${entries.length} captured ${isConsoleTimeouts ? 'timeout' : 'error'} message${entries.length !== 1 ? 's' : ''}`;
        html += `</summary>`;
        html += `<div style="margin-top: 8px; max-height: 400px; overflow-y: auto; background: #f8f9fa; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.8em; line-height: 1.8;">`;
        for (let i = 0; i < entries.length; i++) {
            const entryText = isConsoleTimeouts ? entries[i].replace(/^TIMEOUT:\s*/, '') : entries[i];
            const bgColor = i % 2 === 0 ? '#fff' : '#f1f3f5';
            html += `<div style="padding: 6px 10px; background: ${bgColor}; border-radius: 4px; margin-bottom: 2px; word-break: break-all;">`;
            html += `<span style="color: #999; margin-right: 8px;">${i + 1}.</span>${escapeHtml(entryText)}`;
            html += `</div>`;
        }
        html += `</div></details>`;
    } else if (isConsoleErrors || isConsoleTimeouts) {
        const count = metric && metric.values ? (metric.values.count || 0) : 0;
        if (count > 0) {
            html += `<div style="margin-top: 8px; color: #999; font-size: 0.85em; font-style: italic;">`;
            html += `<i class="fas fa-info-circle"></i> ${count} ${isConsoleTimeouts ? 'timeout' : 'error'}(s) counted — log entries not available`;
            html += `</div>`;
        }
    }

    html += `</div>`;
    return html;
}

/**
 * Generate the thresholds section HTML
 * Displays pass/fail status for all configured thresholds.
 * Uses k6's built-in evaluation when available, falls back to self-evaluation.
 */
function generateThresholdsSection(data, consoleErrorLog, configuredThresholds) {
    let passedCount = 0;
    let failedCount = 0;
    let thresholdItems = '';

    // Separate console errors and timeouts from the log
    const timeoutEntries = (consoleErrorLog || []).filter(e => e.startsWith("TIMEOUT:"));
    const errorEntries = (consoleErrorLog || []).filter(e => !e.startsWith("TIMEOUT:"));

    // First: try to use k6's built-in threshold evaluation (attached to metrics)
    let hasK6Thresholds = false;
    for (const metricName in data.metrics) {
        if (data.metrics[metricName].thresholds) {
            hasK6Thresholds = true;
            break;
        }
    }

    if (hasK6Thresholds) {
        // Use k6's threshold evaluation
        for (const metricName in data.metrics) {
            const metric = data.metrics[metricName];
            if (!metric.thresholds) continue;
            for (const thresholdName in metric.thresholds) {
                const isPassed = metric.thresholds[thresholdName].ok;
                if (isPassed) passedCount++; else failedCount++;
                thresholdItems += buildThresholdItem(metricName, thresholdName, isPassed, metric, consoleErrorLog, timeoutEntries, errorEntries);
            }
        }
    } else if (configuredThresholds && Object.keys(configuredThresholds).length > 0) {
        // Fallback: self-evaluate thresholds from config against metric values
        for (const metricName in configuredThresholds) {
            const rules = configuredThresholds[metricName]; // e.g. ["p(95)<3000"]
            const metric = data.metrics ? data.metrics[metricName] : null;
            if (!Array.isArray(rules)) continue;
            for (const rule of rules) {
                const isPassed = metric ? evaluateThreshold(rule, metric) : null;
                if (isPassed === true) passedCount++;
                else if (isPassed === false) failedCount++;
                // null = metric not present (no data)
                thresholdItems += buildThresholdItem(metricName, rule, isPassed, metric, consoleErrorLog, timeoutEntries, errorEntries);
            }
        }
    }

    let html = '<div class="chart-container">';
    html += '<h3 class="chart-title"><i class="fas fa-gauge-high"></i> Threshold Results</h3>';

    if (passedCount === 0 && failedCount === 0) {
        html += '<p style="color: #6c757d; text-align: center; padding: 40px;">No thresholds configured for this test</p>';
    } else {
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 2.5em; font-weight: 700; color: #155724;">${passedCount}</div>
                <div style="color: #155724; font-weight: 600;">Passed</div>
            </div>
            <div style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 2.5em; font-weight: 700; color: #721c24;">${failedCount}</div>
                <div style="color: #721c24; font-weight: 600;">Failed</div>
            </div>
        </div>`;
        html += thresholdItems;
    }

    html += '</div>';
    return html;
}

/**
 * Generate the test info section HTML
 * Displays additional test configuration and metadata
 * 
 * @param {Object} additionalInfo - Key-value pairs of test information
 * @returns {string} HTML string for the test info section
 */
function generateTestInfoSection(additionalInfo) {
    let html = '<div class="chart-container">';
    html += '<h3 class="chart-title"><i class="fas fa-info-circle"></i> Test Configuration & Additional Information</h3>';
    
    html += '<table class="info-table">';
    
    // Generate table row for each info item
    for (let key in additionalInfo) {
        html += '<tr>';
        html += `<td><i class="fas fa-caret-right" style="color: #667eea; margin-right: 8px;"></i>${escapeHtml(key)}</td>`;
        html += `<td>${escapeHtml(String(additionalInfo[key]))}</td>`;
        html += '</tr>';
    }
    
    html += '</table>';
    html += '</div>';
    
    return html;
}

/**
 * Generate the overview section HTML
 * Contains performance charts and data transfer statistics
 * 
 * @param {Object} stats - Calculated statistics object
 * @returns {string} HTML string for the overview section
 */
function generateOverviewSection(stats) {
    return `
        <div class="chart-container">
            <h3 class="chart-title">Performance Overview</h3>
            
            <!-- Success Rate Progress Bar -->
            <div style="margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Success Rate</span>
                    <span class="metric-value-good">${stats.successRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stats.successRate}%">${stats.successRate}%</div>
                </div>
            </div>

            <!-- Error Rate Progress Bar -->
            <div style="margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Error Rate</span>
                    <span class="metric-value-bad">${stats.errorRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill error" style="width: ${stats.errorRate}%">${stats.errorRate}%</div>
                </div>
            </div>

            <!-- Response Time Statistics Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
                <!-- Minimum Response Time -->
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">MIN</div>
                    <div style="font-size: 1.8em; font-weight: 700; color: #28a745;">${stats.minResponseTime}ms</div>
                </div>
                <!-- Average Response Time -->
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">AVG</div>
                    <div style="font-size: 1.8em; font-weight: 700; color: #667eea;">${stats.avgResponseTime}ms</div>
                </div>
                <!-- 95th Percentile Response Time -->
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">P95</div>
                    <div style="font-size: 1.8em; font-weight: 700; color: #f2994a;">${stats.p95ResponseTime}ms</div>
                </div>
                <!-- Maximum Response Time -->
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">MAX</div>
                    <div style="font-size: 1.8em; font-weight: 700; color: #dc3545;">${stats.maxResponseTime}ms</div>
                </div>
            </div>
        </div>

        <!-- Data Transfer Statistics -->
        <div class="chart-container">
            <h3 class="chart-title">Data Transfer</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
                <!-- Data Received -->
                <div style="text-align: center;">
                    <i class="fas fa-download" style="font-size: 3em; color: #667eea; opacity: 0.3;"></i>
                    <div style="font-size: 2em; font-weight: 700; margin: 10px 0;">${stats.dataReceived} MB</div>
                    <div style="color: #6c757d;">Data Received</div>
                </div>
                <!-- Data Sent -->
                <div style="text-align: center;">
                    <i class="fas fa-upload" style="font-size: 3em; color: #764ba2; opacity: 0.3;"></i>
                    <div style="font-size: 2em; font-weight: 700; margin: 10px 0;">${stats.dataSent} MB</div>
                    <div style="color: #6c757d;">Data Sent</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts characters like <, >, &, etc. to HTML entities
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML-safe text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}