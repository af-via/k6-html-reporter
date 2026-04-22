export interface CustomSection {
    /** Unique ID for the tab (used as HTML element ID) */
    id: string;
    /** Tab title displayed in the navigation */
    title: string;
    /** Font Awesome icon name (without 'fa-' prefix), e.g. "bolt", "puzzle-piece" */
    icon?: string;
    /** HTML content to render inside the tab panel */
    content: string;
}

export interface ReportOptions {
    /** Main title for the report (defaults to current timestamp) */
    title?: string;
    /** Subtitle or endpoint description */
    subtitle?: string;
    /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
    httpMethod?: string;
    /** Key-value pairs of additional test information to display */
    additionalInfo?: Record<string, string | number | boolean>;
    /** Custom tab sections to add to the report */
    customSections?: CustomSection[];
    /** Array of console error/timeout log strings for expandable threshold details */
    consoleErrorLog?: string[];
    /** Threshold config from k6 options (e.g. { "http_req_duration": ["p(95)<3000"] }). Used as fallback when k6 doesn't attach threshold results to metrics. */
    configuredThresholds?: Record<string, string[]>;
    /** If true, logs the raw k6 data to console for debugging */
    debug?: boolean;
}

/**
 * Generate an HTML report from k6 test results.
 *
 * @param data - The k6 handleSummary data object
 * @param options - Configuration options for the report
 * @returns Complete HTML document as a string
 */
export function htmlReport(data: any, options?: ReportOptions): string;