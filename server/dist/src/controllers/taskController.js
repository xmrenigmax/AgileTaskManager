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
exports.updateTaskStatus = exports.getTasks = exports.createTasks = void 0;
const client_1 = require("@prisma/client");
// Reusable error handler
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({
        message,
        error: error instanceof Error ? error.message : String(error)
    });
};
const getTasks = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project_ID } = req.query;
    // Validate project_ID
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
                select: {
                    task_ID: true,
                    title: true,
                    status: true,
                    priority: true,
                    startDate: true,
                    dueDate: true,
                    // add other required fields only
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
        handleError(res, error, "An error occurred while processing your request.");
    }
});
exports.getTasks = getTasks;
const createTasks = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, status, priority, tags, startDate, dueDate, points, project_ID, author_user_ID, assigned_user_ID, updatedAt } = req.body;
    // Check for required fields
    if (!title || !startDate || !dueDate) {
        res.status(400).json({ message: "Missing required fields: title, startDate, dueDate" });
        return;
    }
    // Enhanced validation and sanitization
    if (typeof title !== "string" ||
        typeof description !== "string" ||
        !title.trim() ||
        !description.trim() ||
        isNaN(Date.parse(startDate)) ||
        isNaN(Date.parse(dueDate)) ||
        !Array.isArray(tags) ||
        !tags.every((tag) => typeof tag === "string" && tag.trim()) ||
        !["LOW", "MEDIUM", "HIGH"].includes(priority) ||
        !Object.values(client_1.TaskStatus).includes(status) ||
        isNaN(Number(project_ID)) ||
        (author_user_ID !== undefined && isNaN(Number(author_user_ID))) ||
        (assigned_user_ID !== undefined && isNaN(Number(assigned_user_ID))) ||
        (points !== undefined && isNaN(Number(points)))) {
        res.status(400).json({ message: "Invalid input data" });
        return;
    }
    try {
        const newTask = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                startDate,
                dueDate,
                points: points !== undefined ? Number(points) : undefined,
                project_ID: Number(project_ID),
                author_user_ID: author_user_ID !== undefined ? Number(author_user_ID) : undefined,
                assigned_user_ID: assigned_user_ID !== undefined ? Number(assigned_user_ID) : undefined,
                updatedAt
            },
            select: {
                task_ID: true,
                title: true,
                status: true,
                // add other required fields only
            }
        });
        // Respond with the newly created tasks
        res.status(201).json(newTask);
    }
    catch (error) {
        handleError(res, error, "An error occurred while processing your request.");
    }
});
exports.createTasks = createTasks;
const updateTaskStatus = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { task_ID } = req.params;
    const { status } = req.body;
    if (!task_ID || isNaN(Number(task_ID))) {
        res.status(400).json({ message: "Invalid or missing task_ID parameter." });
        return;
    }
    if (!status || typeof status !== "string") {
        res.status(400).json({ message: "Invalid or missing status in request body." });
        return;
    }
    try {
        const updatedTask = yield prisma.task.update({
            where: {
                task_ID: Number(task_ID),
            },
            data: {
                status: status,
            },
        });
        res.status(200).json(updatedTask);
    }
    catch (error) {
        handleError(res, error, "An error occurred while updating the task status.");
    }
});
exports.updateTaskStatus = updateTaskStatus;
