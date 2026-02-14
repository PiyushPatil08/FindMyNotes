const cloudinary = require('./cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer
 * @param {string} folder - The folder in Cloudinary
 * @param {string} resourceType - 'image' or 'raw' (default: 'image')
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Extract public ID and version from Cloudinary URL
 * @param {string} url - The secure_url
 * @returns {Object|null} - { publicId, version }
 */
const getCloudinaryDetails = (url) => {
    if (!url || !url.includes('cloudinary')) return null;

    // Example URL: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/filename.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    let version = null;
    let pathPart = parts[1]; // v1234567890/folder/filename.jpg

    // Extract version if present
    const versionMatch = pathPart.match(/^v(\d+)\//);
    if (versionMatch) {
        version = versionMatch[1];
        pathPart = pathPart.replace(/^v\d+\//, '');
    }

    // Extract Public ID
    let publicIdWithExt = pathPart;
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

    return { publicId, version };
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - The secure_url
 * @returns {string|null} - The public ID
 */
const getPublicIdFromUrl = (url) => {
    const details = getCloudinaryDetails(url);
    return details ? details.publicId : null;
};

/**
 * Delete file from Cloudinary from a URL
 * This extracts the public ID from the URL.
 * @param {string} url - The secure_url of the asset
 * @param {string} resourceType - 'image' or 'raw' (default: 'image')
 */
const deleteFromCloudinary = async (url, resourceType = 'image') => {
    try {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return;

        console.log(`Deleting from Cloudinary: ${publicId}`);
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl, getCloudinaryDetails };
