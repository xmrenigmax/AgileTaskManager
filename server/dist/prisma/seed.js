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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Define the directory where your JSON data files are stored
const dataDirectory = path_1.default.join(__dirname, "seedData");
function deleteAllData(orderedFileNames, tx) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            return modelName.charAt(0).toUpperCase() + modelName.slice(1);
        });
        for (const modelName of modelNames) {
            const model = tx[modelName];
            if (!model) {
                throw new Error(`Model "${modelName}" does not exist on the Prisma client.`);
            }
            try {
                yield model.deleteMany({});
                console.log(`Cleared data from ${modelName}`);
            }
            catch (error) {
                console.error(`Error clearing data from ${modelName}:`, error);
            }
        }
    });
}
// Simple validation example: ensure jsonData is an object
function isValidData(data) {
    // Add model-specific validation as needed
    return data && typeof data === "object";
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const orderedFileNames = [
            "team.json",
            "project.json",
            "projectTeam.json",
            "user.json",
            "task.json",
            "attachment.json",
            "comment.json",
            "taskAssignment.json",
        ];
        // Check if dataDirectory exists
        if (!fs_1.default.existsSync(dataDirectory)) {
            throw new Error(`Data directory "${dataDirectory}" does not exist.`);
        }
        yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            yield deleteAllData(orderedFileNames, tx);
            for (const fileName of orderedFileNames) {
                const filePath = path_1.default.join(dataDirectory, fileName);
                if (!fs_1.default.existsSync(filePath)) {
                    console.error(`File ${fileName} does not exist in data directory, skipping.`);
                    continue;
                }
                let fileContent;
                try {
                    fileContent = yield fs_1.default.promises.readFile(filePath, "utf-8");
                }
                catch (err) {
                    console.error(`Unable to read ${fileName}:`, err);
                    continue;
                }
                let jsonData;
                try {
                    jsonData = JSON.parse(fileContent);
                }
                catch (err) {
                    console.error(`Invalid JSON in ${fileName}:`, err);
                    continue;
                }
                const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
                const model = tx[modelName];
                if (!model) {
                    throw new Error(`Model "${modelName}" does not exist on the Prisma client.`);
                }
                // Validate data before inserting
                if (!Array.isArray(jsonData)) {
                    console.error(`Invalid data format in ${fileName}: Expected an array.`);
                    continue;
                }
                const validData = jsonData.filter(isValidData);
                if (validData.length !== jsonData.length) {
                    console.error(`Some invalid data detected in ${fileName}, skipping invalid entries.`);
                }
                try {
                    yield model.createMany({ data: validData });
                    console.log(`Seeded ${modelName} with data from ${fileName}`);
                }
                catch (error) {
                    console.error(`Error seeding data for ${modelName}:`, error);
                }
            }
        }));
    });
}
main()
    .catch((e) => console.error(e))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
