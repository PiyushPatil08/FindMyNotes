const User = require('../Models/User');
const Notes = require('../Models/Notes');
const { deleteFromCloudinary } = require('../utils/uploadHelper');

// Get all authors (users), with optional search
exports.getAllAuthors = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { userName: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query).select('-userPassword');
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get author profile and their notes
exports.getAuthorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-userPassword');
        const notes = await Notes.find({ uploadedBy: id });
        res.json({ user, notes });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Search users/authors by name or email
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);
        const users = await User.find({
            $or: [
                { userName: { $regex: query, $options: 'i' } },
                { userEmail: { $regex: query, $options: 'i' } }
            ]
        }).select('userName userEmail profileImage');
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        // If profile image is being updated, delete the old one
        if (updateFields.profileImage) {
            const currentUser = await User.findById(id);
            if (currentUser && currentUser.profileImage &&
                currentUser.profileImage !== updateFields.profileImage &&
                currentUser.profileImage.includes('cloudinary')) {
                await deleteFromCloudinary(currentUser.profileImage, 'image');
            }
        }

        // Optionally, validate fields here
        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-userPassword');
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 