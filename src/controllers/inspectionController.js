const prisma = require('../prisma/prismaConnection');

// 1. Buyer: Request Inspection or Service
const requestInspection = async (req, res) => {
    try {
        const {
            productId,
            userBikeId,
            type = 'INSPECTION', // INSPECTION or SERVICE
            serviceType,
            offerAmount,
            message,
            scheduledDate
        } = req.body;

        const buyerId = req.user.id;

        // Validation based on Type
        if (type === 'INSPECTION') {
            if (!productId) return res.status(400).json({ message: "Product ID is required for inspections" });
            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product) return res.status(404).json({ message: "Product not found" });
            if (product.type !== 'BIKE') return res.status(400).json({ message: "Inspections are only available for bikes" });
        } else if (type === 'SERVICE') {
            if (!userBikeId) return res.status(400).json({ message: "User Bike ID is required for services" });
            if (!serviceType) return res.status(400).json({ message: "Service Type (e.g., Water Wash) is required" });

            const bike = await prisma.userBike.findUnique({ where: { id: userBikeId } });
            if (!bike) return res.status(404).json({ message: "Bike not found in garage" });
            if (bike.userId !== buyerId) return res.status(403).json({ message: "You don't own this bike" });
        } else {
            return res.status(400).json({ message: "Invalid request type" });
        }

        // Validate Offer Amount (Minimum 500 can be arbitrary, keeping it for now)
        if (offerAmount && offerAmount < 100) {
            return res.status(400).json({ message: "Minimum offer amount is 100" });
        }

        // Create Request
        const inspectionData = {
            productId: type === 'INSPECTION' ? productId : undefined,
            userBikeId: type === 'SERVICE' ? userBikeId : undefined,
            buyerId,
            type,
            serviceType,
            offerAmount: parseFloat(offerAmount),
            message,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            status: 'PENDING'
        };

        const inspection = await prisma.inspection.create({
            data: inspectionData
        });

        res.status(201).json(inspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 1.1 Buyer: Get My Requests
const getMyInspections = async (req, res) => {
    try {
        const inspections = await prisma.inspection.findMany({
            where: { buyerId: req.user.id },
            include: {
                product: {
                    select: { title: true, brand: true, model: true, images: { take: 1 } }
                },
                userBike: true, // Include garage bike details
                mechanic: {
                    select: { user: { select: { name: true, phone: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(inspections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 1.2 Get Request by ID
const getInspectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const inspection = await prisma.inspection.findUnique({
            where: { id },
            include: {
                product: { include: { seller: true } },
                userBike: true,
                mechanic: {
                    include: {
                        user: {
                            select: { name: true, phone: true }
                        }
                    }
                },
                buyer: { select: { id: true, name: true, phone: true } }
            }
        });

        if (!inspection) return res.status(404).json({ message: "Request not found" });

        // Authorization
        const isBuyer = inspection.buyerId === userId;
        const isMechanic = inspection.mechanic && inspection.mechanic.userId === userId;
        const isSeller = inspection.product?.seller?.userId === userId; // Only for inspections

        if (!isBuyer && !isMechanic && !isSeller) {
            return res.status(403).json({ message: "Not authorized to view this request" });
        }

        res.json(inspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Mechanic: Get My Jobs (Gigs)
const getMechanicInspections = async (req, res) => {
    try {
        const mechanicProfile = await prisma.mechanicProfile.findUnique({ where: { userId: req.user.id } });
        if (!mechanicProfile) return res.status(403).json({ message: "Not authorized as mechanic" });

        const inspections = await prisma.inspection.findMany({
            where: { mechanicId: mechanicProfile.id },
            include: {
                product: { select: { title: true, brand: true, model: true, address: true, images: { take: 1 } } },
                userBike: true,
                buyer: { select: { name: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(inspections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Mechanic: Get Available Gigs (Marketplace)
const getAvailableInspections = async (req, res) => {
    try {
        const mechanicProfile = await prisma.mechanicProfile.findUnique({ where: { userId: req.user.id } });
        if (!mechanicProfile) return res.status(403).json({ message: "Not authorized as mechanic" });

        const inspections = await prisma.inspection.findMany({
            where: {
                mechanicId: null,
                status: 'PENDING'
            },
            include: {
                product: { select: { title: true, brand: true, model: true, address: true, images: { take: 1 } } },
                userBike: true,
                buyer: { select: { name: true } } // Only name visible before acceptance
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(inspections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// 3.1 Buyer: Cancel Inspection
const cancelInspection = async (req, res) => {
    try {
        const { id } = req.params;
        const buyerId = req.user.id;

        const inspection = await prisma.inspection.findUnique({
            where: { id }
        });

        if (!inspection) return res.status(404).json({ message: "Inspection not found" });

        if (inspection.buyerId !== buyerId) {
            return res.status(403).json({ message: "Unauthorized to cancel this inspection" });
        }

        if (inspection.status !== 'PENDING') {
            return res.status(400).json({ message: "Can only cancel inspections that are PENDING" });
        }

        const updatedInspection = await prisma.inspection.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        res.json(updatedInspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Mechanic: Update Status (Accept/Reject)
const updateInspectionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const mechanicUserId = req.user.id;

        // Verify ownership or if it's an available inspection
        const inspection = await prisma.inspection.findUnique({
            where: { id },
            include: { mechanic: true }
        });

        if (!inspection) return res.status(404).json({ message: "Inspection not found" });

        const mechanicProfile = await prisma.mechanicProfile.findUnique({
            where: { userId: mechanicUserId }
        });

        if (!mechanicProfile) return res.status(403).json({ message: "Mechanic profile not found" });

        // If inspection is already assigned, verify ownership
        if (inspection.mechanicId && inspection.mechanicId !== mechanicProfile.id) {
            return res.status(403).json({ message: "Unauthorized: Inspection assigned to another mechanic" });
        }

        // If accepting an open inspection
        if (!inspection.mechanicId && status === 'ACCEPTED') {
            // Logic handled below to assign mechanic
        } else if (!inspection.mechanicId) {
            return res.status(403).json({ message: "You must ACCEPT an open inspection to assign it to yourself" });
        }

        if (status === 'REJECTED' && !rejectionReason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const dataToUpdate = {
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : null
        };

        // Assign mechanic if accepting
        if (!inspection.mechanicId && status === 'ACCEPTED') {
            dataToUpdate.mechanicId = mechanicProfile.id;
        }

        const updatedInspection = await prisma.inspection.update({
            where: { id },
            data: dataToUpdate
        });

        res.json(updatedInspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Mechanic: Submit Report
const submitInspectionReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, overallComment } = req.body; // scores: { engine: 80, ... }
        const mechanicUserId = req.user.id;

        const inspection = await prisma.inspection.findUnique({
            where: { id },
            include: { mechanic: true }
        });

        if (!inspection) return res.status(404).json({ message: "Inspection not found" });
        if (inspection.mechanic.userId !== mechanicUserId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (inspection.status !== 'ACCEPTED') {
            return res.status(400).json({ message: "Inspection must be ACCEPTED before submitting report" });
        }

        const updatedInspection = await prisma.inspection.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                reportData: {
                    scores,
                    overallComment
                }
            }
        });

        res.json(updatedInspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Seller: Get Inspections for My Products
const getSellerInspections = async (req, res) => {
    try {
        const sellerProfile = await prisma.sellerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!sellerProfile) return res.status(403).json({ message: "Not authorized as seller" });

        const inspections = await prisma.inspection.findMany({
            where: {
                product: {
                    sellerId: sellerProfile.id
                }
            },
            include: {
                product: {
                    select: { title: true }
                },
                mechanic: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestInspection,
    getMyInspections,
    getInspectionById,
    getMechanicInspections,
    getAvailableInspections,
    cancelInspection,
    updateInspectionStatus,
    submitInspectionReport,
    getSellerInspections
};
