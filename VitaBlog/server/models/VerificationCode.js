const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VerificationCode = sequelize.define('VerificationCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('signup', 'login', 'password_reset'),
      defaultValue: 'signup'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    userData: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Store user registration data until verification'
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
    tableName: 'verification_codes',
    timestamps: true,
    indexes: [
      {
        fields: ['email', 'code'],
        unique: false
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  return VerificationCode;
};

