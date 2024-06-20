import dotenv from 'dotenv';
dotenv.config();
import { appRouter } from "./endpoints";
import express from "express";
import { Documentation, attachRouting, AppConfig } from "express-zod-api";
import * as fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { oauth2Client, authorizeUrl, generateJWT } from "./googleAuth";
import { google } from 'googleapis';
import url from 'url';
import { Client } from 'pg';


const app = express();
const PORT = 3000;

const config: AppConfig<string> = {
    app,
    cors: true,
    logger: {level: 'debug', color: true},
};

// PostgreSQL Client Setup
// const client = new Client({
//     user: 'yourusername',
//     host: 'localhost',
//     database: 'jobtracker',
//     password: 'yourpassword',
//     port: 5432,
//   });
//   client.connect();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Career Documents API",
            version: "1.0.0",
            description: "A simple Express Library API to serve resume and cover letter files.",
        },
        servers: [{
            url: "ec2-user@ec2-35-95-46-69.us-west-2.compute.amazonaws.com" //`http://localhost:${PORT}`,
        }],
    },
    apis: ["./API_Documentation.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

attachRouting(config, appRouter);


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const Shutdown = () => {
    console.log('Received shutdown signal, shutting down gracefully...');
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit();
    });

    setTimeout(() => {
        console.error('Forcing shutdown as connections are taking too long to close.');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', Shutdown);
process.on('SIGTERM', Shutdown);