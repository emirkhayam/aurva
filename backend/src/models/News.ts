import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NewsAttributes {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'regulation' | 'events' | 'analytics' | 'other';
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsCreationAttributes extends Optional<NewsAttributes, 'id' | 'slug' | 'published' | 'publishedAt' | 'views' | 'createdAt' | 'updatedAt'> {}

class News extends Model<NewsAttributes, NewsCreationAttributes> implements NewsAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public excerpt!: string;
  public content!: string;
  public category!: 'regulation' | 'events' | 'analytics' | 'other';
  public imageUrl?: string;
  public published!: boolean;
  public publishedAt?: Date;
  public views!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

News.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('regulation', 'events', 'analytics', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'news',
    timestamps: true,
    hooks: {
      beforeCreate: (news: News) => {
        if (!news.slug) {
          news.slug = news.title
            .toLowerCase()
            .replace(/[^а-яёa-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        if (news.published && !news.publishedAt) {
          news.publishedAt = new Date();
        }
      },
      beforeUpdate: (news: News) => {
        if (news.changed('published') && news.published && !news.publishedAt) {
          news.publishedAt = new Date();
        }
      }
    },
    indexes: [
      {
        fields: ['slug']
      },
      {
        fields: ['published']
      },
      {
        fields: ['category']
      },
      {
        fields: ['published_at']
      }
    ]
  }
);

export default News;
