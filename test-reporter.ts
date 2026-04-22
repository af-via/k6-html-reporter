import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from './k6-html-reporter.js';

export const options = {
    scenarios: {
        shared_iteration: {
            executor: 'shared-iterations',
            vus: 20,
            iterations: 100,
            maxDuration: '60s',
        }
    },

    // Basic Non-Functional Validations
    /* Thresholds are the pass/fail criteria that you define for your test metrics. 
    If the performance of the system under test (SUT) does not meet the conditions of your threshold, the test will finish with a failed status. */
    thresholds: {
        'http_req_failed': ['rate==0.00'], // http errors should be 0%
        'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1000ms or 1s
        'checks': ['rate==1.00'], // the rate of successful checks should be 100%
    },
};

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
    // 80% chance of success vs failure for randomization
    const isSuccess = Math.random() < 0.8;

    let response: http.Response;
    if (isSuccess) {
        // Successful request
        response = http.get("https://httpbin.org/get");
    } else {
        // Failed request
        response = http.get("https://httpbin.org/status/500");

    }

    // Run checks on the response
    console.log('Response Status: ', response.status);

    check(response, {
        'Response status 200': (r) => r.status === 200,
    });

    if (response.status !== 200) {
        console.error('Error Response Body: ', response.body);
    }

}

export function handleSummary(data: any) {
    const currentFileName = __ENV.K6_SCRIPT_NAME || 'test-reporter';
    const reportFileName = `./reports/${currentFileName}-${new Date().toJSON().split(':').join('-')}.html`;
    return {
        [reportFileName]: htmlReport(data)
    };
}