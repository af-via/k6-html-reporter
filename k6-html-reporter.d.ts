export interface ReportOptions {
    /** Main title for the report (defaults to current timestamp) */
    title?: string;
    /** Subtitle or endpoint description */
    subtitle?: string;
    /** HTTP method (GET, POST, PUT, DELETE, PATCH) */
    httpMethod?: string;
    /** Key-value pairs of additional test information to display */
    additionalInfo?: Record<string, string | number | boolean>;
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