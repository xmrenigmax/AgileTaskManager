"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTasks = exports.updateTaskStatus = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
/**
 * Helper function to check if a value is a valid TaskStatus enum value.
 * This is used to validate user input for the 'status' field.
 */
function isTaskStatus(value) {
    return Object.values(client_1.TaskStatus).includes(value);
}
/**
 * Helper function to check if a value is a valid TaskPriority enum value.
 * This is used to validate user input for the 'priority' field.
 */
function isTaskPriority(value) {
    return Object.values(client_1.TaskPriority).includes(value);
}
/**
 * Controller to fetch tasks for a given project, with pagination.
 * Validates query parameters and returns tasks along with pagination metadata.
 */
const getTasks = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project_ID } = req.query;
    // Validate project_ID: must be present, a number, and positive
    const projectIdNum = Number(project_ID);
    if (!project_ID || isNaN(projectIdNum) || projectIdNum <= 0) {
        res.status(400).json({
            message: "Missing or invalid 'project_ID' query parameter."
        });
        return;
    }
    try {
        // Parse and validate 'limit' query parameter, default to 10 if invalid or not provided
        const limit = (() => {
            const val = parseInt(req.query.limit);
            if (isNaN(val) || val <= 0 || val > 100)
                return 10;
            return val;
        })();
        // Parse and validate 'offset' query parameter, default to 0 if invalid or not provided
        const offset = (() => {
            const val = parseInt(req.query.offset);
            if (isNaN(val) || val < 0)
                return 0;
            return val;
        })();
        // Fetch tasks and total count concurrently for better performance
        const [tasks, total] = yield Promise.all([
            prisma.task.findMany({
                skip: offset,
                take: limit,
                where: {
                    project_ID: projectIdNum,
                },
                include: {
                    author: true,
                    assignee: true,
                    comments: true,
                    attachments: true,
                    // Add only the fields needed in the response for efficiency and security
                },
            }),
            prisma.task.count({
                where: {
                    project_ID: projectIdNum,
                }
            })
        ]);
        // Respond with tasks and pagination metadata
        res.status(200).json({
            data: tasks,
            meta: {
                total,
                limit,
                offset
            }
        });
    }
    catch (error) {
        // Log only sanitized error message to avoid leaking sensitive info
        console.error('Error fetching tasks:', { message: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            message: "An error occurred while processing your request."
        });
    }
});
exports.getTasks = getTasks;
/**
 * Controller to create a new task.
 * Validates and sanitizes input, then creates the task in the database.
 */
const createTasks = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Destructure expected fields from the request body
    const { title, description, status, priority, tags, startDate, dueDate, points, project_ID, author_user_ID, assigned_user_ID, updatedAt } = req.body;
    // Check for required fields: title, startDate, dueDate must be present
    if (!title || !startDate || !dueDate) {
        res.status(400).json({ message: "Missing required fields: title, startDate, dueDate" });
        return;
    }
    // Basic validation and sanitization for input fields
    if (typeof title !== "string" ||
        (description && (typeof description !== "string" || !description.trim())) || // description is optional, but if present must be a non-empty string
        !title.trim() ||
        isNaN(Date.parse(startDate)) || // startDate must be a valid date string
        isNaN(Date.parse(dueDate)) // dueDate must be a valid date string
    ) {
        res.status(400).json({ message: "Invalid input data" });
        return;
    }
    // Validate status: if present, must be a valid TaskStatus enum value
    if (status && !isTaskStatus(status)) {
        res.status(400).json({ message: "Invalid status value." });
        return;
    }
    // Validate priority: if present, must be a valid TaskPriority enum value
    if (priority && !isTaskPriority(priority)) {
        res.status(400).json({ message: "Invalid priority value." });
        return;
    }
    // Validate tags: if present, must be an array of strings
    if (tags && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string"))) {
        res.status(400).json({ message: "Invalid tags value." });
        return;
    }
    // Validate IDs: if present, must be positive numbers
    if ((project_ID && (isNaN(Number(project_ID)) || Number(project_ID) <= 0)) ||
        (author_user_ID && (isNaN(Number(author_user_ID)) || Number(author_user_ID) <= 0)) ||
        (assigned_user_ID && (isNaN(Number(assigned_user_ID)) || Number(assigned_user_ID) <= 0))) {
        res.status(400).json({ message: "Invalid ID values." });
        return;
    }
    try {
        // Create the new task in the database
        const newTask = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                startDate,
                dueDate,
                points,
                project_ID,
                author_user_ID,
                assigned_user_ID,
                updatedAt,
            },
            select: {
                task_ID: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                // Add only the fields needed in the response
            }
        });
        // Respond with the newly created task
        res.status(201).json(newTask);
    }
    catch (error) {
        // Log only sanitized error message
        console.error('Error creating task:', { message: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            message: "An error occurred while processing your request."
        });
    }
});
exports.createTasks = createTasks;
/**
 * Controller to update the status of a task.
 * Validates input and ensures the task exists before updating.
 */
const updateTaskStatus = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { task_ID } = req.params;
    const { status } = req.body;
    // Validate task_ID: must be present and a number
    if (!task_ID || isNaN(Number(task_ID))) {
        res.status(400).json({ message: "Invalid or missing task_ID parameter." });
        return;
    }
    // Validate status: must be a valid TaskStatus enum value
    if (!isTaskStatus(status)) {
        res.status(400).json({ message: "Invalid status value." });
        return;
    }
    try {
        // Check if the task exists before attempting to update
        const existingTask = yield prisma.task.findUnique({
            where: { task_ID: Number(task_ID) }
        });
        if (!existingTask) {
            res.status(404).json({ message: "Task not found." });
            return;
        }
        // Update the task's status
        const updatedTask = yield prisma.task.update({
            where: { task_ID: Number(task_ID) },
            data: { status: status },
        });
        // Respond with the updated task
        res.status(200).json(updatedTask);
    }
    catch (error) {
        // Log only sanitized error message
        console.error('Error updating task status:', { message: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            message: "An error occurred while updating the task status."
        });
    }
});
exports.updateTaskStatus = updateTaskStatus;
