"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const projectRoutes_1 = __importDefault(require("../routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("../routes/taskRoutes"));
const searchRoutes_1 = __importDefault(require("../routes/searchRoutes"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const teamRoutes_1 = __importDefault(require("../routes/teamRoutes"));
const allowedOrigins = [
    'https://agile-task-manager-client.vercel.app',
    //'http://localhost:3000'
];
const apiApp = (0, express_1.default)();
apiApp.use(express_1.default.json());
apiApp.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
apiApp.use((0, morgan_1.default)("dev"));
apiApp.use(body_parser_1.default.json());
apiApp.use(body_parser_1.default.urlencoded({ extended: false }));
apiApp.use((0, cors_1.default)({
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
// API Root
apiApp.get('/', (req, res) => {
    res.json({
        message: "API Root. Available endpoints:",
        endpoints: [
            '/projects',
            '/tasks',
            '/search',
            '/users',
            '/teams',
            '/priority/:level'
        ]
    });
});
apiApp.use('/projects', projectRoutes_1.default);
apiApp.use('/tasks', taskRoutes_1.default);
apiApp.use('/search', searchRoutes_1.default);
apiApp.use('/users', userRoutes_1.default);
apiApp.use('/teams', teamRoutes_1.default);
apiApp.get('/priority/:level', (req, res) => {
    const { level } = req.params;
    res.json({
        status: 'success',
        data: { level, tasks: [] }
    });
});
apiApp.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
// 404 handler
apiApp.use((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        requestedUrl: req.originalUrl
    });
});
// Error handler
apiApp.use((err, req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error',
        message: err.message
    });
});
exports.default = apiApp;
