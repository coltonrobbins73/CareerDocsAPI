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

// Generate documentation in YAML format and save it
const yamlString = new Documentation({
    routing: appRouter,
    config,
    version: "1.0.0",
    title: "Document Service API",
    serverUrl: `http://localhost:${PORT}`,
    composition: "inline",
  }).getSpecAsYaml();

fs.writeFileSync('API_Documentation.yaml', yamlString);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Job Document Service API",
            version: "1.0.0",
            description: "A simple Express Library API to serve resume and cover letter files.",
        },
        servers: [{
            url: `http://localhost:${PORT}`,
        }],
    },
    apis: ["./API_Documentation.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

attachRouting(config, appRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

