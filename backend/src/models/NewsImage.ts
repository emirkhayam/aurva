import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NewsImageAttributes {
  id: number;
  newsId: number;
  imageUrl: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsImageCreationAttributes extends Optional<NewsImageAttributes, 'id' | 'displayOrder' | 'createdAt' | 'updatedAt'> {}

class NewsImage extends Model<NewsImageAttributes, NewsImageCreationAttributes> implements NewsImageAttributes {
  public id!: number;
  public newsId!: number;
  public imageUrl!: string;
  public displayOrder!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    newsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'news_images',
    timestamps: true,
    indexes: [
      {
        fields: ['news_id']
      },
      {
        fields: ['display_order']
      }
    ]
  }
);

export default NewsImage;
