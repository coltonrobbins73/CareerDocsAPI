// utils/logger.ts
import winston from 'winston';
import { SeqTransport } from '@datalust/winston-seq';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

console.log('SEQ_SERVER_URL:', process.env.SEQ_SERVER_URL);
console.log('SEQ_API_KEY:', process.env.SEQ_API_KEY ? 'API key set' : 'No API key');

const logger = winston.createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { application: 'job-seeker' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new SeqTransport({
      serverUrl: process.env.SEQ_SERVER_URL || "http://localhost:5341", 
      apiKey: process.env.SEQ_API_KEY, 
      onError: (e) => { console.error('Error connecting to Seq:', e); },
      handleExceptions: true,
      handleRejections: true,
    })
  ]
});

logger.info('Logger initialized with Seq transport', {
  serverUrl: process.env.SEQ_SERVER_URL,
  apiKey: process.env.SEQ_API_KEY ? 'API key set' : 'No API key'
});

export default logger;