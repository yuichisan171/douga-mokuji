'use strict';
const pug = require('pug');
const Post = require('./post');

function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
        res.end(pug.renderFile('./views/posts.pug', {
          posts: posts,
          user: req.user
        }));
      });
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);

        const url = decoded.split('url=')[1].split('&')[0].slice(-8);
        const content = decoded.split('content=')[1];

        console.info('urlが投稿されました: ' + url);
        console.info('contentが投稿されました: ' + content);

        Post.create({
          url: url,
          content: content,
          trackingCookie: null,
          postedBy: req.user
        }).then(() => {
          handleRedirectPosts(req, res);
        });
      });
      break;
    default:
      break;
  }
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const id = decoded.split('id=')[1];
        Post.findByPk(id).then((post) => {
          if (req.user === post.postedBy) {
            post.destroy().then(() => {
              console.info(
                `削除されました: user: ${req.user}, ` +
                `remoteAddress: ${req.connection.remoteAddress}, ` +
                `userAgent: ${req.headers['user-agent']}`
              );
              handleRedirectPosts(req, res);
            });
          }
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handle,
  handleDelete
};