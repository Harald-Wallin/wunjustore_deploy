import express from "express";
import { createOrder, getOrderById, getAllOrders} from "../services/orderService.js";

const router = express.Router();

//post
router.post("/", async (request, response) => {
    try {
        const {userId,beatIds} = request.body;

        if (!userId) {
            return response.status(400).json({
                success: false,
                message: "userId is required"
            });
        }


        if (!Array.isArray(beatIds) || beatIds.length === 0) {
            return response.status(400).json({
                success: false,
                message: "beatIds must contain at least one beat"
            });
        }

        const order = await createOrder(userId,beatIds);

        response.status(201).json({
            success: true,
            order
        });

    } catch (error) {

        console.error(
            "Failed to create order:",
            error
        );


        if (error.message === "USER_NOT_FOUND") {
            return response.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        if (error.message === "BEAT_NOT_FOUND") {
            return response.status(400).json({
                success: false,
                message: "One or more beats do not exist"
            });
        }


        response.status(500).json({
            success: false,
            message: "Could not create order"
        });
    }
});



//get /api/orders/:orderId
router.get("/:orderId", async (request, response) => {
    try {
        const orderId = Number(request.params.orderId);
        const order = await getOrderById(orderId);

        if (!order) {
            return response.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        response.status(200).json({
            success: true,
            order
        });

    } catch (error){

        console.error(
            "Failed to get order:",
            error
        );

        response.status(500).json({
            success: false,
            message: "Could not fetch order"
        });
    }
});


//get orders
router.get("/", async (request, response) => {
    try {
        const orders = await getAllOrders();

        response.status(200).json({
            success: true,
            orders
        });

    } catch (error) {

        console.error("Failed to get orders:",error);

        response.status(500).json({
            success: false,
            message: "Could not fetch orders"
        });
    };
});


export default router;