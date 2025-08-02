"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get("/", userController_1.getUsers);
router.post("/", userController_1.postUser);
router.get("/:cognitoId", userController_1.getUser);
exports.default = router;
