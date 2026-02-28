import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum TeamMemberCategory {
  LEADERSHIP = 'leadership',
  COUNCIL = 'council',
  OTHER = 'other'
}

interface TeamMemberAttributes {
  id: number;
  name: string;
  position: string;
  photoUrl?: string;
  bio?: string;
  category: TeamMemberCategory;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamMemberCreationAttributes extends Optional<TeamMemberAttributes, 'id' | 'photoUrl' | 'bio' | 'displayOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: number;
  public name!: string;
  public position!: string;
  public photoUrl?: string;
  public bio?: string;
  public category!: TeamMemberCategory;
  public displayOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamMember.init(
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
    position: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('leadership', 'council', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'team_members',
    timestamps: true,
    indexes: [
      {
        fields: ['category']
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

export default TeamMember;
