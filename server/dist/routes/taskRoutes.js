"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import controller functions for handling task-related requests
const taskController_1 = require("../controllers/taskController");
// Import PrismaClient for database access
const client_1 = require("@prisma/client");
// Create a new Express router instance for task routes
const router = (0, express_1.Router)();
// Instantiate a single PrismaClient instance for use in all route handlers
const prisma = new client_1.PrismaClient();
// Route: GET /
// Description: Fetch a paginated list of tasks for a given project.
// Controller: getTasks handles validation, querying, and response formatting.
router.get("/", (0, taskController_1.getTasks)(prisma));
// Route: POST /
// Description: Create a new task with the provided data in the request body.
// Controller: createTasks handles validation, creation, and response.
router.post("/", (0, taskController_1.createTasks)(prisma));
// Route: PATCH /:task_ID/TaskStatus
// Description: Update the status of a specific task identified by task_ID.
// Controller: updateTaskStatus handles validation, existence check, update, and response.
router.patch("/:task_ID/status", (0, taskController_1.updateTaskStatus)(prisma));
// Export the configured router for use in the main application
exports.default = router;
