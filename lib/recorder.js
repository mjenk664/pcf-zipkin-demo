/* eslint-env browser */
const {
    BatchRecorder,
    jsonEncoder: {JSON_V2}
} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');

const debug = 'undefined' !== typeof window
    ? window.location.search.indexOf('debug') !== -1
    : process.env.DEBUG;

// Send spans to Zipkin asynchronously over HTTP
const zipkinBaseUrl = process.env.ZIPKIN_BASE_URL || 'https://zipkin-server.apps.mjenk.io';

const httpLogger = new HttpLogger({
    endpoint: `${zipkinBaseUrl}/api/v2/spans`,
    jsonEncoder: JSON_V2
});

function recorder(serviceName) {
    return debug ? consoleRecorder(serviceName) : new BatchRecorder({logger: httpLogger});
}

function consoleRecorder(serviceName) {
    // Log Zipkin data to STDOUT in JSON
    const logger = {
        logSpan: (span) => {
            const json = JSON_V2.encode(span);
            console.log(`${json}`);
            httpLogger.logSpan(span);
        }
    };

    const batchRecorder = new BatchRecorder({logger});

    return ({
        record: (rec) => {
            const {spanId, traceId} = rec.traceId;
            console.log(`${serviceName} recording: ${traceId}/${spanId} ${rec.annotation.toString()}`);
            batchRecorder.record(rec);
        }
    });
}

module.exports.recorder = recorder;