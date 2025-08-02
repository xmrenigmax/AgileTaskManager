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
exports.postUser = exports.getUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
// User Controller Functions
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving users: ${error.message}` });
    }
});
exports.getUsers = getUsers;
// Get user by cognito ID
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cognitoId } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                cognito_ID: cognitoId,
            },
        });
        // If user not found, return 404
        res.json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user: ${error.message}` });
    }
});
exports.getUser = getUser;
// Create a new user
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, cognito_ID, profilePictureUrl = "i1.jpg", team_ID = 1, } = req.body;
        const newUser = yield prisma.user.create({
            data: {
                username,
                cognito_ID,
                profilePictureUrl,
                team_ID,
            },
        });
        res.json({ message: "User Created Successfully", newUser });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving users: ${error.message}` });
    }
});
exports.postUser = postUser;
