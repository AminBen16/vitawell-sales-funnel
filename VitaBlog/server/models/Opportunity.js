const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Opportunity = sequelize.define('Opportunity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('partnership', 'affiliate', 'investment', 'collaboration'),
      defaultValue: 'partnership'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    benefits: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    earnings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'opportunities',
    timestamps: true
  });

  return Opportunity;
};
