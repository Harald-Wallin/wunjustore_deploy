
import express from "express";

import {getOrderById,getAllOrders,getOrdersByUserId} from "../services/orderService.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";

const router = express.Router();

//alla order-routes kräver en inloggad användare + hämta användares roll
router.use(requireAuth, loadCurrentUser);


// Den inloggade användarens ordrar
router.get("/me", async (req, res) => {
    try {
        const orders = await getOrdersByUserId(
            req.currentUser.id
        );

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Failed to get user orders:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch user orders"
        });
    }
});


//Bara admin får se alla ordrar
router.get("/", async (req, res) => {
    if (req.currentUser.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    try {
        const orders = await getAllOrders();

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Failed to get orders:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch orders"
        });
    }
});



//user får endast se sina egna ordrar,
//Admin får läsa ALLAS ordrar
router.get("/user/:userId", async (req, res) => {
    const requestedUserId = Number(req.params.userId);

    if (!Number.isSafeInteger(requestedUserId) || requestedUserId <= 0) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    const isOwner = requestedUserId === req.currentUser.id;
    const isAdmin = req.currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try {
        const orders = await getOrdersByUserId(requestedUserId);

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Failed to get user orders:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch user orders"
        });
    }
});


//Bara ägaren till ordern (eller admin) får läsa order
router.get("/:orderId", async (req, res) => {
    const orderId = Number(req.params.orderId);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            message: "Invalid order ID"
        });
    }

    try {
        const order = await getOrderById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const isOwner = order.customer.id === req.currentUser.id;
        const isAdmin = req.currentUser.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Failed to get order:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch order"
        });
    }
});

export default router;
