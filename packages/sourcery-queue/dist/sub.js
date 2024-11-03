"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcerySub = void 0;
const dotenv = __importStar(require("dotenv"));
const bullmq_1 = require("bullmq");
dotenv.config();
class SourcerySub {
    worker;
    constructor(fn, queue_name = "sourcery.info") {
        if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
            throw new Error("Please provide REDIS_HOST and REDIS_PORT");
        }
        this.worker = new bullmq_1.Worker(queue_name, async (job) => {
            job.data.channel = job.name;
            return await fn(job.data);
        }, {
            connection: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT),
            },
        });
    }
    async close() {
        await this.worker.close();
    }
}
exports.SourcerySub = SourcerySub;
