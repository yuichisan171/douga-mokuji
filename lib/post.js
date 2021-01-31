'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/douga_mokuji',
  {
    logging: false
  }
);
const Post = sequelize.define(
  'Post',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    url: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT
    },
    postedBy: {
      type: Sequelize.STRING
    },
    trackingCookie: {
      type: Sequelize.STRING
    }
  },
  {
    freezeTableName: true,
    timestamps: true
  }
);

Post.sync();
module.exports = Post;