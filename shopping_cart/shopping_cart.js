require('babel-polyfill');
require('babel-core/register');

const axios = require('axios');
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('../lib/recorder');

const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'shopping-cart';
const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});

const app = express();

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({tracer}));

// instrument the client
const wrapAxios = require('zipkin-instrumentation-axiosjs');
const zipkinAxios = wrapAxios(axios, {tracer});

// Allow cross-origin, traced requests. See http://enable-cors.org/server_expressjs.html
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', [
    'Origin', 'Accept', 'X-Requested-With', 'X-B3-TraceId',
    'X-B3-ParentSpanId', 'X-B3-SpanId', 'X-B3-Sampled'
  ].join(', '));
  next();
});

// Send GET to process order
app.get('/', (req, res) => {
  zipkinAxios.get(`https://${process.env.ORDERS_HOST}/process-order`)
      .then(response => res.send(response.data))
      .catch(err => console.error('Error', err.response ? err.response.status : err.message));
});

app.listen(process.env.PORT || 5000, () => {
  console.log('payments listening on port ' + process.env.PORT || 5000);
});