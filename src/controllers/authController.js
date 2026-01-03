// src/controllers/authController.js
const prisma = require('../prisma/prismaConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;

const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, roleDetails } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start Transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create User
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone
        }
      });

      // 2. Handle Role Specifics
      if (role === 'seller') {
        if (!roleDetails || !roleDetails.businessName) {
          throw new Error("Missing seller details: businessName is required.");
        }

        // Basic GST Verification Mock
        const isVerified = !!roleDetails.gstNumber;

        await prisma.sellerProfile.create({
          data: {
            userId: newUser.id,
            businessName: roleDetails.businessName,
            gstNumber: roleDetails.gstNumber,
            isVerified
          }
        });
      } else if (role === 'mechanic') {
        if (!roleDetails || !roleDetails.experienceYears || !roleDetails.shopAddress || !roleDetails.hourlyRate) {
          throw new Error("Missing mechanic details: experienceYears, shopAddress, and hourlyRate are required.");
        }

        await prisma.mechanicProfile.create({
          data: {
            userId: newUser.id,
            experienceYears: parseInt(roleDetails.experienceYears),
            shopAddress: roleDetails.shopAddress,
            hourlyRate: parseFloat(roleDetails.hourlyRate),
            isMobileService: !!roleDetails.isMobileService,
            isVerified: false
          }
        });
      } else if (role === 'user') {
        // Handle User Bike Registration
        if (roleDetails && roleDetails.hasBike && roleDetails.bikeModel) {
          await prisma.userBike.create({
            data: {
              userId: newUser.id,
              brand: "",
              model: roleDetails.bikeModel,
              year: roleDetails.bikeYear ? parseInt(roleDetails.bikeYear) : 2024,
              registration: roleDetails.registration || "XX XX XXXX"
            }
          });
        }
      }

      return newUser;
    });

    const roles = {
      isMechanic: role === 'mechanic',
      isSeller: role === 'seller',
      isAdmin: false
    };

    const token = jwt.sign(
      { id: result.id, email: result.email, roles },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.id,
        name: result.name,
        roles
      }
    });
  } catch (error) {
    if (error.message.includes("Missing")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { mechanicProfile: true, sellerProfile: true, adminProfile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Determine Roles
    const roles = {
      isMechanic: !!user.mechanicProfile,
      isSeller: !!user.sellerProfile,
      isAdmin: !!user.adminProfile
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        roles
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const getUploadSignature = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "products" },
    process.env.CLOUD_API_SECRET
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUD_API_KEY,
    cloudName: process.env.CLOUD_NAME,
    folder: "products"
  });
};

module.exports = { register, login, getUploadSignature };