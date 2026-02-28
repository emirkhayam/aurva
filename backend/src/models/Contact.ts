import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ContactAttributes {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: 'new' | 'contacted' | 'processed' | 'rejected';
  notes?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactCreationAttributes extends Optional<ContactAttributes, 'id' | 'email' | 'status' | 'notes' | 'ip' | 'userAgent' | 'createdAt' | 'updatedAt'> {}

class Contact extends Model<ContactAttributes, ContactCreationAttributes> implements ContactAttributes {
  public id!: number;
  public name!: string;
  public phone!: string;
  public email?: string;
  public status!: 'new' | 'contacted' | 'processed' | 'rejected';
  public notes?: string;
  public ip?: string;
  public userAgent?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'processed', 'rejected'),
      allowNull: false,
      defaultValue: 'new'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

export default Contact;
