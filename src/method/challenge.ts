// src/method/challenge.ts

import { Request, Response, NextFunction } from "express";
import Challenge from "../models/challenge";

const challengeFunctions = {
  // GET /challenge
  async getChallenges(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page = "1", limit = "10" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
      const challenges = await Challenge.find()
        .skip(skip)
        .limit(parseInt(limit));
      res.status(200).json({ success: true, challenges });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  // GET /challenge/:challengeId
  async getChallenge(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { challengeId } = req.params;
    if (!challengeId) {
      res
        .status(400)
        .json({ success: false, message: "No challengeId provided" });
      return;
    }

    try {
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        res
          .status(404)
          .json({ success: false, message: "Challenge not found" });
        return;
      }
      res.status(200).json({ success: true, challenge });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  // POST /challenge
  async createChallenge(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, startDate, endDate } = req.body;
      if (!title || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: title, startDate, endDate",
        });
        return;
      }
      const newChallenge = new Challenge({
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      await newChallenge.save();
      res.status(200).json({ success: true, challenge: newChallenge });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
};

export default challengeFunctions;
