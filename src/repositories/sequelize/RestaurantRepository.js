import RepositoryBase from '../RepositoryBase.js'
import {
    RestaurantSequelize,
    RestaurantCategorySequelize,
    ProductSequelize,
    ProductCategorySequelize,
    ReviewSequelize,
    OrderSequelize
} from './models/models.js'
import Sequelize, {col, fn, literal, Op} from "sequelize";
import * as sequelize from "sequelize";

class RestaurantRepository extends RepositoryBase {
    async findById(id, ...args) {
        return RestaurantSequelize.findByPk(id, {
            attributes: {exclude: ['userId']},
            include: [{
                model: ProductSequelize,
                as: 'products',
                include: [
                    {model: ProductCategorySequelize, as: 'productCategory'},
                    {
                        model: ReviewSequelize,
                        as: 'reviews',
                        required: false
                    },
                ]
            },
                {
                    model: RestaurantCategorySequelize,
                    as: 'restaurantCategory'
                }],
            order: [[{model: ProductSequelize, as: 'products'}, 'order', 'ASC']]
        })
    }

    async findAll(...args) {
        return RestaurantSequelize.findAll(
            {
                attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
                include:
                    {
                        model: RestaurantCategorySequelize,
                        as: 'restaurantCategory'
                    },
                order: [[{model: RestaurantCategorySequelize, as: 'restaurantCategory'}, 'name', 'ASC']]
            }
        )
    }

    async create(restaurantData, ...args) {
        return (new RestaurantSequelize(restaurantData)).save()
    }

    async update(id, dataToUpdate, ...args) {
        const entity = await RestaurantSequelize.findByPk(id)
        entity.set(dataToUpdate)
        return entity.save()
    }

    async destroy(id, ...args) {
        const result = await RestaurantSequelize.destroy({where: {id}})
        return result === 1
    }

    async save(businessEntity, ...args) {
        return this.create(businessEntity)
    }

    async findByOwnerId(ownerId) {
        return RestaurantSequelize.findAll(
            {
                attributes: {exclude: ['userId']},
                where: {userId: ownerId},
                include: [{
                    model: RestaurantCategorySequelize,
                    as: 'restaurantCategory'
                }]
            })
    }

    async updateAverageServiceTime(restaurantId) {
        const restaurant = await RestaurantSequelize.findByPk(restaurantId)
        const averageServiceTime = await restaurant.getAverageServiceTime()
        await RestaurantSequelize.update({averageServiceMinutes: averageServiceTime}, {where: {id: restaurantId}})
    }

    async show(id) {
        return this.findById(id)
    }

    async top() {
        const now = new Date();

        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
        const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

        const topRestaurantsLastWeek = await OrderSequelize.findAll({
            attributes: [
                'restaurantId',
                [Sequelize.fn('SUM', Sequelize.col('price')), 'totalPrice']
            ],
            where: {
                DeliveredAt: {
                    [Op.not]: null,
                    [Op.gte]: startOfWeek,
                    [Op.lt]: endOfWeek
                }
            },
            group: ['restaurantId']
        });

        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const topRestaurantsLastMonth = await OrderSequelize.findAll({
            attributes: [
                'restaurantId',
                [Sequelize.fn('SUM', Sequelize.col('price')), 'totalPrice']
            ],
            where: {
                DeliveredAt: {
                    [Op.not]: null,
                    [Op.gte]: startOfMonth,
                    [Op.lt]: endOfMonth
                }
            },
            group: ['restaurantId']
        });


        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear + 1, 0, 1);
        const topRestaurantsLastYear = await OrderSequelize.findAll({
            attributes: [
                'restaurantId',
                [Sequelize.fn('SUM', Sequelize.col('price')), 'totalPrice']
            ],
            where: {
                DeliveredAt: {
                    [Op.not]: null,
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            group: ['restaurantId']
        });

        return {
            topRestaurantsLastWeek,
            topRestaurantsLastMonth,
            topRestaurantsLastYear
        };
    }

    async topDeliverers() {
        const restaurantsCount = await RestaurantSequelize.count();

        return OrderSequelize.findAll({
            attributes: [
                'restaurantId',
                [fn('SUM', fn('TIME_TO_SEC', fn('TIMEDIFF', col('deliveredAt'), col('sentAt')))), 'timeSpent']
            ],
            group: 'restaurantId',
            order: [[literal('timeSpent'), 'DESC']],
            LIMIT: Math.ceil(restaurantsCount * 0.1)
        });
    }

    async bottomDeliverers() {
        const restaurantsCount = await RestaurantSequelize.count();

        return OrderSequelize.findAll({
            attributes: [
                'restaurantId',
                [fn('SUM', fn('TIME_TO_SEC', fn('TIMEDIFF', col('deliveredAt'), col('sentAt')))), 'timeSpent']
            ],
            group: 'restaurantId',
            order: [[literal('timeSpent'), 'ASC']],
            LIMIT: Math.ceil(restaurantsCount * 0.1)
        });
    }

    async search(query) {
        const {postalCode, categoryId, expensive, sortBy} = query

        let havingClause;
        if (expensive !== undefined) {
            const averagePrice = (await ProductSequelize.findAll({
                attributes: [[fn('AVG', col('price')), 'averagePrice']]
            })).map(p => p.get('averagePrice'));

            havingClause = sequelize.literal(`AVG(Products.price) ${expensive ? '>' : '<'} ${averagePrice}`);
        }

        let orderClause = [];

        if (sortBy === 'deliveryTime') {
            orderClause.push([OrderSequelize, fn('TIMEDIFF', col('deliveredAt'), col('sentAt')), 'ASC']);
        } else if (sortBy === 'preparationTime') {
            orderClause.push([OrderSequelize, fn('TIMEDIFF', col('sentAt'), col('createdAt')), 'ASC']);
        }

        return await RestaurantSequelize.findAll({
            where: postalCode ? {postalCode} : {},
            include: [
                {
                    model: ProductSequelize,
                    as: 'products',
                    include: categoryId ? [{
                        model: ProductCategorySequelize,
                        as: 'productCategory',
                        where: {id: categoryId},
                    }] : []
                },
                {
                    as: 'orders',
                    model: OrderSequelize,
                    group: ['Restaurant.id'],
                    having: havingClause,
                    order: orderClause
                }]
        });
    }
}

export default RestaurantRepository
