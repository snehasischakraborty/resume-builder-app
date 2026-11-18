const router = require('express').Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

// Get my resume
router.get('/', auth, async (req, res) => {
  const resume = await Resume.findOne({ user: req.userId });
  res.json(resume || {});
});

// Create or update my resume
router.post('/', auth, async (req, res) => {
  try {
    const { _id, user, ...data } = req.body;
    const resume = await Resume.findOneAndUpdate(
      { user: req.userId }, { ...data, user: req.userId },
      { new: true, upsert: true }
    );
    res.json(resume);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
