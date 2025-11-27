import { v2 as cloudinary } from "cloudinary";

export const getUploadedFile = async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);

        const paramsToSign = {
            timestamp,
            folder: req.query.folder || "brandverse/uploads",
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            success: true,
            signature,
            api_key: process.env.CLOUDINARY_API_KEY,
            timestamp,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            folder: paramsToSign.folder,
        });
    } catch (err) {
        console.error("signature error", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const saveUploadFile = async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id)
            return res.status(400).json({ success: false, message: "public_id required" });

        const result = await cloudinary.uploader.destroy(public_id);

        res.json({ success: true, result });
    } catch (err) {
        console.error("delete error", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
