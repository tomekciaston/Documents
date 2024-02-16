module.exports = {
    // The "up" method is used for creating the "Reviews" table
    up: async (queryInterface, Sequelize) => {
        // Creating the "Reviews" table using queryInterface.createTable
        await queryInterface.createTable('Reviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false, // Title cannot be empty
            },
            body: {
                type: Sequelize.STRING,
                allowNull: false, // Body cannot be empty
            },
            stars: {
                type: Sequelize.TINYINT,
                allowNull: false, // Stars must have a value
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'Products'
                    },
                    key: 'id'
                }
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'Users'
                    },
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date()
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date()
            }
        });
    },

    // The "down" method is used for dropping the "Reviews" table
    down: async (queryInterface, Sequelize) => {
        // Dropping the "Reviews" table using queryInterface.dropTable
        await queryInterface.dropTable('Reviews');
    }
};