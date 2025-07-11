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
/* configurations */
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// CORS: Allow requests from frontend (localhost:3000) during development
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
/* Routes */
app.get('/', (req, res) => {
    res.send("this server is running correctly");
});
// usage cases
app.use("/projects", projectRoutes_1.default);
app.use("/tasks", taskRoutes_1.default);
// Catch-all 404 handler
app.use((req, res) => {
    res.status(404).send('Not Found');
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
// Use PORT from env or fallback to 8000 for backend (not 3000!)
const portEnv = process.env.PORT;
const port = portEnv && !isNaN(Number(portEnv)) ? Number(portEnv) : 8000;
if (portEnv && isNaN(Number(portEnv))) {
    console.error(`Invalid PORT value "${portEnv}". Falling back to 8000.`);
}
app.listen(port, () => {
    console.log(`Server Running On Port : ${port} `);
    console.log(`CORS allowed origins: http://localhost:3000`);
});
