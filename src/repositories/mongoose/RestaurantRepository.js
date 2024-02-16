import mongoose from 'mongoose'
import RepositoryBase from '../RepositoryBase.js'
import RestaurantMongoose from './models/RestaurantMongoose.js'
import restaurantMongoose from "./models/RestaurantMongoose.js";

class RestaurantRepository extends RepositoryBase {
    async findById(id, ...args) {
        try {
            const leanNeeded = args[0]?.lean
            if (leanNeeded) {
                return await RestaurantMongoose.findById(id).lean()
            }
            return await RestaurantMongoose.findById(id)
        } catch (err) {
            return null
        }
    }

    async findAll() {
        return RestaurantMongoose.find().populate('restaurantCategory')
    }

    async create(restaurantData) {
        return (new RestaurantMongoose(restaurantData)).save()
    }

    async update(id, restaurantData) {
        return RestaurantMongoose.findByIdAndUpdate(id, restaurantData, {new: true})
    }

    async destroy(id) {
        return (await RestaurantMongoose.findByIdAndDelete(id)) !== null
    }

    async save(entity) {
        return RestaurantMongoose.findByIdAndUpdate(entity.id, entity, {upsert: true, new: true})
    }

    async findByOwnerId(ownerId) {
        return RestaurantMongoose.find({_userId: new mongoose.Types.ObjectId(ownerId)}).populate('restaurantCategory')
    }

    async show(id) {
        return RestaurantMongoose.findById(id).populate(['restaurantCategory', 'products.productCategory'])
    }

    async updateAverageServiceTime(restaurantId) {
        const restaurant = await RestaurantMongoose.findById(restaurantId)
        restaurant.averageServiceMinutes = await restaurant.getAverageServiceTime()
        return restaurant.save()
    }

    async search(query) {
        const { postalCode, categoryId, expensive, sortBy } = query

        let pipeline = [];
        let matchStage = {};

        if (postalCode) {
            matchStage.postalCode = postalCode;
        }

        if (categoryId) {
            matchStage._restaurantCategoryId = new  mongoose.Types.ObjectId(categoryId);
        }

        pipeline.push({ $match: matchStage });
        pipeline.push({ $unwind: "$products" });
        pipeline.push({
            $group: {
                _id: "$_id",
                averagePrice: { $avg: "$products.price" },
                details: { $first: "$$ROOT" }
            }
        });

        let expensiveMatch = {};
        if (expensive === 'true') {
            expensiveMatch.averagePrice = { $gt: 0 };
        } else if (expensive === 'false') {
            expensiveMatch.averagePrice = { $lte: 0 };
        }

        pipeline.push({ $match: expensiveMatch });

        pipeline.push({
            $addFields: {
                "details.deliveryTime": { $subtract: ["$details.deliveredAt", "$details.sentAt"] },
                "details.preparationTime": { $subtract: ["$details.sentAt", "$details.createdAt"] }
            }
        });


        if (sortBy === 'deliveryTime') {
            pipeline.push({ $sort: { "details.deliveryTime": 1 } });
        } else if (sortBy === 'preparationTime') {
            pipeline.push({ $sort: { "details.preparationTime": 1 } });
        }

        pipeline.push({ $replaceRoot: { newRoot: "$details" } });

        return restaurantMongoose.aggregate(pipeline)
    }

    async topDeliverers() {
        const numOfRestaurants = await RestaurantMongoose.count()
        const topBottomLimit = Math.ceil(numOfRestaurants * 0.1);
        return RestaurantMongoose.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "_restaurantId",
                    as: "orders"
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $project: {
                    name: 1,
                    deliveryTime: {
                        $subtract: ["$orders.deliveredAt", "$orders.sentAt"]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    avgDeliveryTime: { $avg: "$deliveryTime" }
                }
            },
            { $sort: { avgDeliveryTime: 1 } },
            { $limit: topBottomLimit }
        ]);

    }

    async bottomDeliverers() {
        const numOfRestaurants = await RestaurantMongoose.count()
        const topBottomLimit = Math.ceil(numOfRestaurants * 0.1);
        return RestaurantMongoose.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "_restaurantId",
                    as: "orders"
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $project: {
                    name: 1,
                    deliveryTime: {
                        $subtract: ["$orders.deliveredAt", "$orders.sentAt"]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    avgDeliveryTime: { $avg: "$deliveryTime" }
                }
            },
            { $sort: { avgDeliveryTime: -1 } },
            { $limit: topBottomLimit }
        ]);
    }

    async top() {
        return RestaurantMongoose.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "_restaurantId",
                    as: "orders"
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $facet: {
                    "topRestaurantsLastWeek": [
                        {
                            $match: {
                                "orders.deliveredAt": {
                                    $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                                    $lte: new Date()
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                restaurant: { $first: "$name" },
                                totalPrice: { $sum: "$orders.price" }
                            }
                        },
                        { $sort: { totalPrice: -1 } },
                        { $limit: 5 }
                    ],
                    "topRestaurantsLastMonth": [
                        {
                            $match: {
                                "orders.deliveredAt": {
                                    $gte: new Date(new Date().setYear(new Date().getFullYear(), new Date().getMonth() - 1)),
                                    $lte: new Date()
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                restaurant: { $first: "$name" },
                                totalPrice: { $sum: "$orders.price" }
                            }
                        },
                        { $sort: { totalPrice: -1 } },
                        { $limit: 5 }
                    ],
                    "topRestaurantsLastYear": [
                        {
                            $match: {
                                "orders.deliveredAt": {
                                    $gte: new Date(new Date().getFullYear(), 0, 1),
                                    $lte: new Date()
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                restaurant: { $first: "$name" },
                                totalPrice: { $sum: "$orders.price" }
                            }
                        },
                        { $sort: { totalPrice: -1 } },
                        { $limit: 5 }
                    ]
                }
            }
        ])
    }
}

export default RestaurantRepository
