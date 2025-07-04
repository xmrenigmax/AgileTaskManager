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
exports.getProjects = void 0;
const getProjects = (prisma) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = (() => {
            const val = parseInt(req.query.limit);
            if (isNaN(val) || val <= 0)
                return 10;
            return val;
        })();
        const offset = (() => {
            const val = parseInt(req.query.offset);
            if (isNaN(val) || val < 0)
                return 0;
            return val;
        })();
        const projects = yield prisma.project.findMany({
            skip: offset,
            take: limit,
        });
        res.status(200).json(projects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: "error" });
    }
});
exports.getProjects = getProjects;
