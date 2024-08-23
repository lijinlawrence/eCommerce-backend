import catchAsyncError from "../middlewares/catchAsyncError.js";
import Orders from "../model/orderModel.js";
import Products from "../model/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";



// new Order
export const newOrder = catchAsyncError(async(req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    
    const order = await Orders.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success: true,
        order
    })
})


//Get Single Order - api/v1/order/:id
export const getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Orders.findById(req.params.id).populate('user', 'name email');
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})



//Get Loggedin User Orders - /api/v1/myorders
export const myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Orders.find({user:req.user.id});

    res.status(200).json({
        success: true,
        orders
    })
})


//Admin: Get All Orders - api/v1/orders
export const orders = catchAsyncError(async (req, res, next) => {
    const orders = await Orders.find();

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})


//Admin: Update Order / Order Status - api/v1/order/:id

let updateStock = async (productId, quantity)=>{
    const product = await Products.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBeforeSave: false})
}


export const updateOrder =  catchAsyncError(async (req, res, next) => {
    const order = await Orders.findById(req.params.id);

    if(order.orderStatus == 'Delivered') {
        return next(new ErrorHandler('Order has been already delivered!', 400))
    }
    //Updating the product stock of each order item
    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity)
    })

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
        success: true
    })
    
});




//Admin: Delete Order - api/v1/order/:id
export const deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Orders.findById(req.params.id);
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    await Orders.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    })
})

