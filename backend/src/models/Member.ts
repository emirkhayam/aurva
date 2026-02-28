import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MemberAttributes {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  displayOrder: number;
  joinedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MemberCreationAttributes extends Optional<MemberAttributes, 'id' | 'slug' | 'description' | 'website' | 'logoUrl' | 'isActive' | 'displayOrder' | 'joinedDate' | 'createdAt' | 'updatedAt'> {}

class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public website?: string;
  public logoUrl?: string;
  public isActive!: boolean;
  public displayOrder!: number;
  public joinedDate?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Member.init(
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    joinedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'members',
    timestamps: true,
    hooks: {
      beforeCreate: (member: Member) => {
        if (!member.slug) {
          member.slug = member.name
            .toLowerCase()
            .replace(/[^а-яёa-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      }
    },
    indexes: [
      {
        fields: ['slug']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['display_order']
      }
    ]
  }
);

export default Member;
