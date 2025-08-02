"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const router = (0, express_1.Router)();
router.get("/", searchController_1.search);
exports.default = router;
