import catchAsyncError from "../middlewares/catchAsyncError.js";
import Products from "../model/productModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import ErrorHandler from "../utils/errorHandler.js";

// create Products-/api/v1/products/
export const newProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const products = await Products.create(req.body);
  res.status(201).json({ success: true, products });
});

//Get all products - /api/v1/products
export const getProducts = async (req, res, next) => {
  try {
    const resPerPage = 3;

    // const apiFeatures = new APIFeatures(Products.find(), req.query)
    //   .search()
    //   .filter()
    //   .paginate(resPerPage);
    let buildQuery = ()=>{
      return new APIFeatures(Products.find(), req.query).search().filter()

    }
    const filteredProductsCount = await buildQuery().query.countDocuments({})
    const totalProductsCount = await Products.countDocuments({});//to count rotal amount of data
    let productsCount = totalProductsCount
    if(filteredProductsCount !== totalProductsCount) {
      productsCount = filteredProductsCount;
  }
  
  const products = await buildQuery().paginate(resPerPage).query;


    res.status(200).json({
      success: true,
      resPerPage,
      count: productsCount,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get Single Product- /api/v1/product/:id

export const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      // return res
      //   .status(404)
      //   .json({ success: false, message: "Product not found" });

      return next(new ErrorHandler("Product not found test", 404));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update product-/api/v1/product/:id

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    // run validators - to check required fields
    res.status(200).json({
      success: true,
      updatedProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product- /api/v1/product/:id

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Products.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Create Review - api/v1/review
export const createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user.id,
    rating,
    comment,
  };

  const product = await Products.findById(productId);
  //finding user review exists
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });

  if (isReviewed) {
    //updating the  review
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //creating the review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //find the average of the product reviews
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;
  product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//Get Reviews - api/v1/reviews?id={productId}
export const getReviews = catchAsyncError(async (req, res, next) => {
  const product = await Products.findById(req.query.id).populate(
    "reviews.user",
    "name email"
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Delete Review - api/v1/review
export const deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Products.findById(req.query.productId);

  //filtering the reviews which does match the deleting review id
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString();
  });
  //number of reviews
  const numOfReviews = reviews.length;

  //finding the average with the filtered reviews
  let ratings =
    reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / reviews.length;
  ratings = isNaN(ratings) ? 0 : ratings;

  //save the product document
  await Products.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });
  res.status(200).json({
    success: true,
    message: "Review Deleted Succesfully",
  });
});
