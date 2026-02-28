import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SiteSettingsAttributes {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SiteSettingsCreationAttributes extends Optional<SiteSettingsAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class SiteSettings extends Model<SiteSettingsAttributes, SiteSettingsCreationAttributes> implements SiteSettingsAttributes {
  public id!: number;
  public key!: string;
  public value!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SiteSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'site_settings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key']
      }
    ]
  }
);

export default SiteSettings;
