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
exports.getTeams = void 0;
const client_1 = require("@prisma/client");
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
// Controller to get all teams with product owner and project manager usernames
const getTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield prisma.team.findMany();
        // Map through teams to get product owner and project manager usernames
        const teamsWithUsernames = yield Promise.all(teams.map((team) => __awaiter(void 0, void 0, void 0, function* () {
            const productOwner = yield prisma.user.findUnique({
                where: { user_ID: team.productOwneruser_ID },
                select: { username: true },
            });
            // map through project managers to get usernames
            const projectManager = yield prisma.user.findUnique({
                where: { user_ID: team.projectManageruser_ID },
                select: { username: true },
            });
            // Return the team with usernames
            return Object.assign(Object.assign({}, team), { productOwnerUsername: productOwner === null || productOwner === void 0 ? void 0 : productOwner.username, projectManagerUsername: projectManager === null || projectManager === void 0 ? void 0 : projectManager.username });
        })));
        // Send the response with teams and their usernames
        res.json(teamsWithUsernames);
    }
    catch (error) {
        console.error('Error in getTeams:', error);
        res
            .status(500)
            .json({ message: `Error retrieving teams: ${error.message}` });
    }
});
exports.getTeams = getTeams;
