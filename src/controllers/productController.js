// src/controllers/productController.js
const prisma = require('../prisma/prismaConnection');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// 1. Create Listing (with AI Sound Doctor placeholder)
// 1. Create Listing
// 1. Create Listing
const createProduct = async (req, res) => {
  try {
    let {
      type,
      title, // Accept title directly
      name,  // Keep name for backward compatibility
      description,
      price,
      images = [],
      condition,
      brand,
      model,
      year,
      kmdriven,
      ownership,
      stock,
      category,
      address
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User information missing from request" });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!seller) {
      return res.status(403).json({ message: "You must be a seller to list items" });
    }

    const categoryData = await prisma.category.findFirst({
      where: {
        OR: [
          { id: category },
          { name: { equals: category, mode: "insensitive" } }
        ]
      }
    });

    if (!categoryData) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const productType = type?.toUpperCase();
    const productCondition = condition
      ? condition.toUpperCase().replace(" ", "_")
      : null;

    // 1️⃣ Create product (WITHOUT images)
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: categoryData.id,
        type: productType,
        title: title || name, // Prefer title, fallback to name
        description,
        price: parseFloat(price),
        condition: productCondition,
        brand,
        model,
        year: year ? parseInt(year) : null,
        kmDriven: kmdriven ? parseInt(kmdriven) : null,
        ownership: ownership ? parseInt(ownership) : null,
        stock: productType === 'BIKE' ? 1 : (parseInt(stock) || 1),
        address
      }
    });

    // 2️⃣ Store images (if any)
    if (images.length > 0) {
      const imageRows = images.map((img, index) => ({
        productId: product.id,
        publicId: img.publicId,
        url: img.url,
        width: img.width ?? null,
        height: img.height ?? null,
        format: img.format ?? null,
        size: img.size ?? null,
        position: img.position ?? index
      }));

      await prisma.image.createMany({
        data: imageRows
      });
    }

    // 3️⃣ Fetch full product details with images
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: {
          orderBy: { position: "asc" }
        },
        seller: true
      }
    });

    res.status(201).json(fullProduct);

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};


const createCategory = async (req, res) => {
  try {
    let { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Category name is required' });
    }
    name = name.trim();

    if (name.length === 0) {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: 'Category already exists',
        category: existingCategory,
      });
    }
    const category = await prisma.category.create({
      data: { name },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);

    return res.status(500).json({
      message: 'Failed to create category',
    });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Products (With Filters)
const getProducts = async (req, res) => {
  try {
    const { brand, model, type, minPrice, maxPrice } = req.query;

    const whereClause = { isSold: false };

    // "My Garage" Logic: Filter strictly by model if provided
    if (brand) whereClause.brand = { contains: brand, mode: 'insensitive' };
    if (model) whereClause.model = { contains: model, mode: 'insensitive' };
    if (type) whereClause.type = type;

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { seller: { include: { user: { select: { name: true } } } } }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: {
        orderBy: { position: "asc" }
      },
      reviews: true,
      seller: true
    }
  });

  res.json(product);
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      condition,
      brand,
      model,
      year,
      kmDriven,
      ownership,
      stock,
      isSold,
      addImages = [],      // New images to add
      deleteImageIds = [],  // IDs of images to delete
      address
    } = req.body;

    // 1. Check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!seller || product.sellerId !== seller.id) {
      return res.status(403).json({ message: 'Unauthorized to update this product' });
    }

    // 2. Handle Image Deletions
    if (deleteImageIds.length > 0) {
      // Fetch images to get publicIds for Cloudinary deletion
      const imagesToDelete = await prisma.image.findMany({
        where: {
          id: { in: deleteImageIds },
          productId: id // Ensure images belong to this product
        }
      });

      // Delete from Cloudinary
      const deletePromises = imagesToDelete.map(img =>
        cloudinary.uploader.destroy(img.publicId)
      );
      await Promise.all(deletePromises);

      // Delete from DB
      await prisma.image.deleteMany({
        where: { id: { in: deleteImageIds } }
      });
    }

    // 3. Handle Image Additions
    if (addImages.length > 0) {
      const imageRows = addImages.map((img, index) => ({
        productId: id,
        publicId: img.publicId,
        url: img.url,
        width: img.width ?? null,
        height: img.height ?? null,
        format: img.format ?? null,
        size: img.size ?? null,
        position: img.position ?? index // You might want to calculate proper position based on existing ones
      }));

      await prisma.image.createMany({
        data: imageRows
      });
    }

    // 4. Update Product Fields
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        condition,
        brand,
        model,
        year: year ? parseInt(year) : undefined,
        kmDriven: kmDriven ? parseInt(kmDriven) : undefined,
        ownership: ownership ? parseInt(ownership) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        isSold: isSold, // Allow toggling sold status
        address
      },
      include: {
        images: {
          orderBy: { position: "asc" }
        },
        seller: true
      }
    });

    res.json(updatedProduct);

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};



const getDashboardProducts = async (req, res) => {
  try {
    // Pagination params for Bikes
    const bikePage = parseInt(req.query.bikePage) || 1;
    const bikeLimit = parseInt(req.query.bikeLimit) || 10;
    const bikeSkip = (bikePage - 1) * bikeLimit;

    // Pagination params for Accessories/others
    const accPage = parseInt(req.query.accPage) || 1;
    const accLimit = parseInt(req.query.accLimit) || 10;
    const accSkip = (accPage - 1) * accLimit;

    // Fetch Bikes
    const [bikes, totalBikes] = await Promise.all([
      prisma.product.findMany({
        where: { type: 'BIKE', isSold: false },
        skip: bikeSkip,
        take: bikeLimit,
        include: {
          images: { orderBy: { position: "asc" } },
          seller: { select: { businessName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: { type: 'BIKE', isSold: false } })
    ]);

    // Fetch Accessories & Parts
    const [accessoriesRaw, totalAccessories] = await Promise.all([
      prisma.product.findMany({
        where: {
          type: { in: ['ACCESSORY', 'PART'] },
          isSold: false
        },
        skip: accSkip,
        take: accLimit,
        include: {
          images: { orderBy: { position: "asc" } },
          seller: { select: { businessName: true } },
          category: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({
        where: {
          type: { in: ['ACCESSORY', 'PART'] },
          isSold: false
        }
      })
    ]);

    // Format Accessories to include category name
    const accessories = accessoriesRaw.map(item => ({
      ...item,
      category: item.category?.name || "Uncategorized" // Hoist category name
    }));

    res.json({
      bikes: {
        data: bikes,
        meta: {
          total: totalBikes,
          page: bikePage,
          limit: bikeLimit,
          totalPages: Math.ceil(totalBikes / bikeLimit)
        }
      },
      accessories: {
        data: accessories,
        meta: {
          total: totalAccessories,
          page: accPage,
          limit: accLimit,
          totalPages: Math.ceil(totalAccessories / accLimit)
        }
      }
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        seller: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Verify Ownership
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the user is the seller of this product
    // Note: product.seller.userId connects SellerProfile to User table
    if (product.seller.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
    }

    // 3. FAIL-SAFE: Check for Associated Orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete product: It is part of existing orders. Please mark it as Sold instead.'
      });
    }

    // 4. FAIL-SAFE: Check for Associated Inspections
    const inspectionCount = await prisma.inspection.count({
      where: { productId: id }
    });

    if (inspectionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete product: It has associated inspections. Please resolve them first.'
      });
    }

    // 5. Cleanup & Deletion
    // Cloudinary Cleanup
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(img =>
        cloudinary.uploader.destroy(img.publicId)
      );
      await Promise.all(deletePromises);
    }

    // Database Cleanup Transaction
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }), // Remove from carts
      prisma.review.deleteMany({ where: { productId: id } }),   // Remove reviews
      prisma.image.deleteMany({ where: { productId: id } }),    // Remove images
      prisma.inspection.deleteMany({ where: { productId: id } }), // (Optional: if we wanted to force delete, but we blocked it above. Keeping for completeness if policy changes)
      prisma.product.delete({ where: { id } })                  // Delete Product
    ]);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, createCategory, getAllCategories, updateProduct, getDashboardProducts, deleteProduct };
