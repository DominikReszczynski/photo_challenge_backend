import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ImageDoc, ImageModel } from "../models/imageDoc";

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
      
      const username = req.user?.username || req.body.username || null;
      
      const createdImages: ImageDoc[] = [];
      
      for (const file of req.files as Express.Multer.File[]){
        const imageDoc = new ImageModel({
          filename: file.filename,
          likes: 0,
          comments: [],
          tags: tags,
          challengeId,
          uploadedAt: new Date(),
          userName: username,
        });
        
        await imageDoc.save();
        createdImages.push(imageDoc);
      }
      
      const filenames = createdImages.map(img => img.filename);
      
      console.log("Utworzone dokumenty zdjęć:", filenames);
      
      return res.status(200).send({ success: true, filenames });
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
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).send({ success: false, message: "Brak filename." });
    }
    
    try {
      const image = await ImageModel.findOne({ filename });
      
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
    
    const { filename } = req.params;
    const filePath = path.resolve("uploads", filename);
    
    if (fs.existsSync(filePath)) {
      return res.status(200).sendFile(filePath);
    }
    
    return res.status(404).send("Plik nie istnieje.");
  },
};

export default imageFunctions;
