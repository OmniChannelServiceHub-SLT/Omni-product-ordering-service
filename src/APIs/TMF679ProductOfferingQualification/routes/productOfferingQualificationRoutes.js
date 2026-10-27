const express = require("express");
const {
  createQualification,
  listQualifications,
  retrieveQualification,
  patchQualification,
  deleteQualification
} = require("../controllers/productOfferingQualificationController");

const router = express.Router();

router.post("/", createQualification);
router.get("/", listQualifications);
router.get("/:id", retrieveQualification);
router.patch("/:id", patchQualification);
router.delete("/:id", deleteQualification);

module.exports = router;
