import mongoose, { Schema, Document } from "mongoose";
import { Comment, CommentSchema } from "./comment";

export interface ImageDoc extends Document {
  challengeId: string;
  tags: string[];
  filename: string;
  likes: number;
  likedBy: string[] 
  comments: Comment[];
  uploadedAt: Date;
  userName: String;
}

const ImageSchema = new Schema<ImageDoc>({
  challengeId: { type: String, default: "" },
  tags: { type: [String], default: [] },
  filename: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: { type: [CommentSchema], default: [] },
  uploadedAt: { type: Date, default: Date.now },
  userName: { type: String, required: true},
});

export const ImageModel = mongoose.model<ImageDoc>("Image", ImageSchema);
