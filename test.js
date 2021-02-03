'use strict';
const pug = require('pug');
const assert = require('assert');

const html = pug.renderFile('./views/posts.pug', {
  posts: [
    {
      id: 1,
      url: "https://www.nicovideo.jp/watch/sm12345678",
      content: "<script>alert('test');</script>",
      postedBy: 'guest1',
      trackingCookie: "1234567812345678_bb92126be15c1995c1d3d03db910a69e1521129d",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  user: 'guest1'
})

assert(html.includes("&lt;script&gt;alert('test');&lt;/script&gt;"));
console.log('テストが正常に完了しました');