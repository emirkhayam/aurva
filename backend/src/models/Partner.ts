import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PartnerAttributes {
  id: number;
  name: string;
  slug: string;
  website?: string;
  logoUrl?: string;
  modalTitle?: string;
  modalDescription?: string;
  benefits?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PartnerCreationAttributes extends Optional<PartnerAttributes, 'id' | 'slug' | 'website' | 'logoUrl' | 'modalTitle' | 'modalDescription' | 'benefits' | 'isActive' | 'displayOrder' | 'createdAt' | 'updatedAt'> {}

class Partner extends Model<PartnerAttributes, PartnerCreationAttributes> implements PartnerAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public website?: string;
  public logoUrl?: string;
  public modalTitle?: string;
  public modalDescription?: string;
  public benefits?: string;
  public isActive!: boolean;
  public displayOrder!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Partner.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Краткое название партнера'
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'URL сайта партнера'
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Путь к логотипу партнера'
    },
    modalTitle: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Полное название для модального окна'
    },
    modalDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание партнера для модального окна'
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Список преимуществ партнерства (каждая строка - отдельный пункт)'
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
    }
  },
  {
    sequelize,
    tableName: 'partners',
    timestamps: true,
    hooks: {
      beforeCreate: (partner: Partner) => {
        if (!partner.slug) {
          partner.slug = partner.name
            .toLowerCase()
            .replace(/[^а-яёa-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      },
      beforeUpdate: (partner: Partner) => {
        if (partner.changed('name') && !partner.changed('slug')) {
          partner.slug = partner.name
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

export default Partner;
