import express from "express";
import { uploadSingle, propertiesFunctions } from "./../method/properties";
const router = express.Router();
const dashboard = require("./../method/dashboard");
const user = require("./../method/user");
import image from "./../method/image";

// ! ########################################
// ! ############ - USER - ##############
// ! ########################################

router.post("/user/login", user.login);
router.post("/user/registration", user.registration);

// ! ########################################
// ! ############ - IMAGE - ##############
// ! ########################################

router.post(
  "/upload/image",
  dashboard.uploadMiddleware,
  dashboard.handleImageUpload
);

router.post(
  "/upload/images",
  image.uploadMultipleMiddleware,
  image.handleMultipleImageUpload
);

router.get(
  "/images/user/:userName",
  image.getImagesByUser
);

router.get(
  "/images/filename/:filename",
  image.getImageDocByFilename
)

router.get(
  "/images/file/:filename",
  image.getImageByFilename
)

// ! ########################################
// ! ############ - PROPERTY - ##############
// ! ########################################
router.post(
  "/property/addProperty",
  uploadSingle,
  propertiesFunctions.addProperty
);

router.post(
  "/property/getAllByOwner",
  propertiesFunctions.getAllPropertiesByOwner
);
router.post("/property/setPin", propertiesFunctions.setPin);

router.post("/property/removePin", propertiesFunctions.removePin);

router.post(
  "/property/addTenantToProperty",
  propertiesFunctions.addTenantToProperty
);

router.post(
  "/property/getAllByTenant",
  propertiesFunctions.getAllPropertiesByTenant
);

module.exports = router;
