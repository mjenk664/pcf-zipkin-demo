/* eslint-disable import/newline-after-import */
// initialize tracer
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('../lib/recorder');

const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'payments';
const tracer = new Tracer({ctxImpl, recorder: recorder(localServiceName), localServiceName});

const app = express();

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({tracer}));

app.get('/charge-card', (req, res) => {
  console.log('/charge-card called');
  res.status(200).send('card successfully charged!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('payments listening on port ' + process.env.PORT || 3000);
});