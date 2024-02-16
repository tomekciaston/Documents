import { check } from 'express-validator';
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js';
import container from '../../config/container.js';

const maxFileSize = 5000

// Utility function to create a standardized string length validation
const isStringLength = ({ min, max }) => 
    check().isString().isLength({ min, max }).withMessage(`Value must be between ${min} and ${max} characters.`);

// Utility function to create a standard integer range validation
const isIntInRange = ({ min, max }) => 
    check().exists().isInt({ min, max }).withMessage(`Value must be an integer between ${min} and ${max}.`);

// Validation to check if the review exists
const checkReviewExists = async (value, { req }) => {
    const productService = container.resolve('productService');
    const { productId, reviewId } = req.params;
    try {
        const reviewExists = await productService.reviewExists(productId, reviewId);
        if (!reviewExists) {
            throw new Error('ReviewId does not exist.');
        }
    } catch (err) {
        throw new Error(err.message); // This maintains the original error message but simplifies error handling
    }
};

// Rules for creating a review
const createRules = [
    check('title').exists().isString().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters.'),
    check('body').exists().isString().isLength({ min: 1, max: 600 }).withMessage('Body must be between 1 and 600 characters.'),
    check('stars').exists().isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer between 1 and 5.')
];

// Rules for updating a review
const updateRules = [
    check('title').exists().isString().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters.'),
    check('body').exists().isString().isLength({ min: 1, max: 600 }).trim().withMessage('Body must be between 1 and 600 characters.'),
    check('stars').exists().isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer between 1 and 5.')
];

export {
    checkReviewExists,
    createRules as create,
    updateRules as update,
};
