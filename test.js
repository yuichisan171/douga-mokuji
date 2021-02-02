'use strict';
const pug = require('pug');
const assert = require('assert');

const html = pug.renderFile('./views/posts.pug', {
  posts: [
    {
      id: 1,
      content: "<script>alert('test');</script>",
      postedBy: 'guest1',
      trackingCookie: '1234567812345678_bb92126be15c1995c1d3d03db910a69e1521129dd70fae16552d6d9cb419584e05d6818e8ca43901',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  user: 'guest1'
})

assert(html.includes("&lt;script&gt;alert('test');&lt;/script&gt;"));
console.log('テストが正常に完了しました');