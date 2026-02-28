import User from './User';
import Contact from './Contact';
import News from './News';
import Member from './Member';
import NewsImage from './NewsImage';
import TeamMember from './TeamMember';
import SiteSettings from './SiteSettings';
import Partner from './Partner';

// Set up relationships
News.hasMany(NewsImage, {
  foreignKey: 'newsId',
  as: 'images',
  onDelete: 'CASCADE'
});

NewsImage.belongsTo(News, {
  foreignKey: 'newsId',
  as: 'news'
});

// Export all models
export {
  User,
  Contact,
  News,
  Member,
  NewsImage,
  TeamMember,
  SiteSettings,
  Partner
};

// Export as default object for convenience
export default {
  User,
  Contact,
  News,
  Member,
  NewsImage,
  TeamMember,
  SiteSettings,
  Partner
};
