
import express, { Request, Response, Router } from 'express';
import prisma from '../../../lib/prisma';
import upload from '../../../middleware/uploads';
import config from '../../../Config';

const router: Router = express.Router();

router.post("/api/admin/upload", upload.single("image"), async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
  
      const { filename, mimetype, size } = req.file;
  
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          filename,
          url: `${config.URLS.baseBackendURL}/uploads/${filename}`, // This is the URL
          mimetype,
          size,
        },
      });
  
      res.status(201).json({
        message: "File uploaded successfully",
        file: uploadedFile,
      });
    } catch (error: any) {
      console.error("Error during upload:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  });
  
// New GET endpoint to fetch all uploaded files
router.get("/api/admin/uploads", async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await prisma.uploadedFile.findMany({
      orderBy: { createdAt: "desc" }, // Optional: Order by most recent files
    });

    res.status(200).json({
      message: "Files retrieved successfully",
      files,
    });
  } catch (error: any) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

export default router;