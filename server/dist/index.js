"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
/* Route import */
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
/* configurations */
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://agile-task-manager-client.vercel.app'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
/* Routes */
app.get('/', (req, res) => {
    res.send("Server is running correctly. API endpoints are available at both root and /api/ paths");
});
// API routes - ensure both prefixed and non-prefixed versions
const API_PREFIX = process.env.API_PREFIX || '/api';
// Handle both prefixed and non-prefixed API routes
const registerRoutes = (prefix = '') => {
    app.use(`${prefix}/projects`, projectRoutes_1.default);
    app.use(`${prefix}/tasks`, taskRoutes_1.default);
    app.use(`${prefix}/search`, searchRoutes_1.default);
    app.use(`${prefix}/users`, userRoutes_1.default);
    app.use(`${prefix}/teams`, teamRoutes_1.default);
    // Priority routes
    app.get(`${prefix}/priority/:level`, (req, res) => {
        const { level } = req.params;
        res.json({
            status: 'success',
            data: {
                level,
                tasks: []
            }
        });
    });
    // Tasks with query params
    app.get(`${prefix}/tasks`, (req, res) => {
        const { project_ID } = req.query;
        res.json({
            status: 'success',
            data: {
                project_ID,
                tasks: []
            }
        });
    });
};
// Register routes with both /api prefix and without
registerRoutes();
registerRoutes(API_PREFIX);
// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        requestedUrl: req.originalUrl
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error',
        message: err.message
    });
});
// Server setup
const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
if (isNaN(port)) {
    console.error(`Invalid PORT value "${process.env.PORT}". Falling back to 8000.`);
}
app.listen(port, () => {
    console.log(`Server Running On Port: ${port}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`API available at:`);
    console.log(`- http://localhost:${port}/projects`);
    console.log(`- http://localhost:${port}/api/projects`);
});
