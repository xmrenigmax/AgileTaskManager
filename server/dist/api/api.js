"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("https://agile-task-manager-server.vercel.app/"));
const index_ts_1 = __importDefault(require("../src/api/index.ts"));
const handler = (0, _1.default)(index_ts_1.default);
exports.default = (req, res) => {
    return handler(req, res);
};
