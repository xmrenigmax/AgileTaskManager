"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./api/index"));
const app = (0, express_1.default)();
// Root endpoint: show API info
app.get('/', (req, res) => {
    res.json({
        message: "Server is running. All API endpoints are available under /api.",
        api: "/api"
    });
});
// Mount API app at /api
app.use('/api', index_1.default);
// Server setup
const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
if (isNaN(port)) {
    console.error(`Invalid PORT value "${process.env.PORT}". Falling back to 8000.`);
}
app.listen(port, () => {
    console.log(`Server Running On Port: ${port}`);
    console.log(`API available at: http://localhost:${port}/api`);
});
