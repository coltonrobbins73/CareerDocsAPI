import {createLogger, format, transports} from 'winston';
import { SeqTransport } from '@datalust/winston-seq';

export const loggerFactory = () => createLogger({
  format: format.combine( /* This is required to get errors to log with stack traces. check it out at https://github.com/winstonjs/winston/issues/1498 */
      format.errors({ stack: true }),
      format.json()
  ),
  defaultMeta: { application: 'career-docs-api' },
  transports: [
    [
      new transports.Console({
        format: format.simple(),
      }),
    ],

    process.env.NODE_ENV === "production" ? [
      new SeqTransport({
        serverUrl: process.env.SEQ_SERVER_URL, 
        apiKey: process.env.SEQ_API_KEY, 
        onError: (e: Error) => { console.error(e); },
        handleExceptions: true,
        handleRejections: true,
      })
    ] :[]
  ].flat(),
});

