import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData;
        try {
            productData = JSON.parse(req.body.productData);
        } catch (error) {
            return res.json({ success: false, message: "Invalid product data format" });
        }

        const images = req.files
        if (!images || images.length === 0) {
            return res.json({ success: false, message: "No images uploaded" });
        }

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        await Product.create({ ...productData, image: imagesUrl })

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Product : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body
        const product = await Product.findById(id)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body
        const product = await Product.findById(id);

        let updateData = { inStock };
        // If enabling stock but quantity is 0, reset to default (e.g. 100)
        if (inStock && product.stockQuantity === 0) {
            updateData.stockQuantity = 100;
        }

        await Product.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Stock Updated" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Add Product Rating : /api/product/rating
export const addProductRating = async (req, res) => {
    try {
        const { userId, productId, rating, comment } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        const userRating = {
            userId,
            rating: Number(rating),
            comment,
            createdAt: new Date()
        }

        if (!product.ratings) {
            product.ratings = []
        }

        // Check if user already rated
        const existingRatingIndex = product.ratings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            product.ratings[existingRatingIndex] = userRating;
        } else {
            product.ratings.push(userRating);
        }

        await product.save();
        res.json({ success: true, message: 'Rating Added' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Delete Product : /api/product/remove
export const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: "Product Deleted" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Delete Product Rating : /api/product/rating/delete
export const deleteProductRating = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        const ratingIndex = product.ratings.findIndex(r => r.userId === userId);
        if (ratingIndex === -1) {
            return res.json({ success: false, message: "Rating not found" })
        }

        product.ratings.splice(ratingIndex, 1);
        await product.save();
        res.json({ success: true, message: "Review Deleted" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

