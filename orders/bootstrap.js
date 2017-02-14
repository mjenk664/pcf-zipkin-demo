import orders from './orders';
import logger from '../lib/logger';
import {ConsoleRecorder, ExplicitContext, Tracer} from 'zipkin';

const log = logger({name: 'orders'});
const ctxImpl = new ExplicitContext();
const recorder = new ConsoleRecorder(log.info.bind(log));
const tracer = new Tracer({ctxImpl, recorder});

orders('orders', log, tracer).listen(process.env.PORT || 3000);