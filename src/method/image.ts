import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ImageDoc, ImageModel } from "../models/imageDoc";
import Challenge from "../models/challenge";

// Folder docelowy
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfiguracja przechowywania
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueName = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueName}${extension}`);
  },
});

const upload = multer({ storage: storage });

const imageFunctions = {
  uploadMultipleMiddleware: upload.array("images", 10), // max 10 zdjęć
  
  async handleMultipleImageUpload(req: any, res: any) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).send({
          success: false,
          message: "Nie przesłano żadnych zdjęć.",
        });
      }
      
      const tags: string[] = req.body.tags
      ? Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(",").map((tag: string) => tag.trim())
      : [];
      
      const challengeId = req.body.challengeId || null;
      
      const userName = req.user?.userName || req.body.userName || null;
      
      const createdImages: ImageDoc[] = [];
      
      for (const file of req.files as Express.Multer.File[]){
        const imageDoc = new ImageModel({
          fileName: file.filename,
          likes: 0,
          comments: [],
          tags: tags,
          challengeId,
          uploadedAt: new Date(),
          userName: userName,
        });
        
        await imageDoc.save();
        createdImages.push(imageDoc);
      }
      
      const fileNames = createdImages.map(img => img.fileName);
      
      console.log("Utworzone dokumenty zdjęć:", fileNames);
      
      return res.status(200).send({ success: true, fileNames });
    } catch (error) {
      console.error("Błąd przy przesyłaniu zdjęć:", error);
      return res.status(500).send({
        success: false,
        message: "Wystąpił błąd serwera.",
      });
    }
  },
  
  async getImagesByUser(req: any, res: any) {
    const { userName } = req.params;
    
    if (!userName) {
      return res.status(400).send({ success: false, message: "Brak userId." });
    }
    
    try {
      const images = await ImageModel.find({ userName }).sort({ uploadedAt: -1 });
      return res.status(200).send({ success: true, images });
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęć użytkownika:", error);
      return res.status(500).send({ success: false, message: "Błąd serwera." });
    }
  },
  
  async getImageDocByFilename(req: any, res: any) {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).send({ success: false, message: "Brak fileName." });
    }
    
    try {
      const image = await ImageModel.findOne({ fileName });
      
      if (!image) {
        return res.status(404).send({ success: false, message: "Nie znaleziono zdjęcia." });
      }
      
      return res.status(200).send({ success: true, image });
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia:", error);
      return res.status(500).send({ success: false, message: "Błąd serwera." });
    }
  },
  
  async getImageByFilename(req: any, res: any) {
    
    const { fileName } = req.params;
    const filePath = path.resolve("uploads", fileName);
    
    if (fs.existsSync(filePath)) {
      return res.status(200).sendFile(filePath);
    }
    
    return res.status(404).send("Plik nie istnieje.");
  },
  
  async likeImage(req: any, res: any) {
    const { fileName } = req.params;
    const userName = req.user?.userName || req.body.userName;
    
    if (!userName) return res.status(400).json({ success: false, message: "No user ID provided." });
    if (!fileName) return res.status(400).json({ success: false, message: "No file name provided." });
    
    try {
      const image = await ImageModel.findOne({ fileName: fileName });
      if (!image) return res.status(404).json({ success: false, message: "Image not found." });
      
      if (!image.likedBy.includes(userName)) {
        image.likes += 1;
        image.likedBy.push(userName);
        await image.save();
        return res.status(200).json({ success: true, likes: image.likes });
      }
      
      res.status(202).json({ success: true, message: "User already liked this photo", likes: image.likes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
  
  async unlikeImage(req: any, res: any) {
    const { fileName } = req.params;
    const userName = req.user?.userName || req.body.userName;
    
    if (!userName) return res.status(400).json({ success: false, message: "No user ID provided." });
    if (!fileName) return res.status(400).json({ success: false, message: "No file name provided." });
    
    try {
      const image = await ImageModel.findOne({ fileName: fileName });
      if (!image) return res.status(404).json({ success: false, message: "Image not found." });
      
      if (image.likedBy.includes(userName)) {
        image.likes = Math.max(image.likes - 1, 0);
        image.likedBy = image.likedBy.filter((id) => id.toString() !== userName.toString());
        await image.save();
        return res.status(200).json({ success: true, likes: image.likes });
      }
      
      res.status(202).json({ success: true, message: "User didn't like this photo before", likes: image.likes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
  
  async getTopLikedImages(req: any, res: any) {
    const { challengeId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    try {
      let filter: any = {};
      if (challengeId) {
        filter.challengeId = challengeId;
      } else {
        // Find active challenge
        const now = new Date();
        const activeChallenge = await Challenge.findOne({
          startDate: { $lte: now },
          endDate: { $gte: now }
        });
        
        if (activeChallenge) {
          filter.challengeId = activeChallenge._id;
        } else {
          return res.status(404).json({ success: false, message: "No active challenge found." });
        }
      }
      
      const images = await ImageModel.find(filter)
      .sort({ likes: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
      res.json({ success: true, images });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
};

export default imageFunctions;
