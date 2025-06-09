import Challenge from "../models/challenge";

const challengeFunctions = {

    async getChallenges(req: any, res: any) {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        try {
            const challenges =  await Challenge.find()
            .skip(skip)
            .limit(parseInt(limit));

            res.status(200).json({ success: true, challenges: challenges});

        } catch(err) {
             console.error(err);
             res.status(500).json({ success: false, message: "Server error." });
        }
    },

    async getChallenge(req: any, res: any) {
        const { challengeId } = req.params;

        if (!challengeId) return res.status(400).json({ success: false, message: "No challengeID provided"});

        try {
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found"});

            res.status(200).json({ success: true, challenge: challenge});
        } catch(err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error." });
        }
    }
};

export default challengeFunctions;