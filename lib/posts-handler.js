'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handler-util');
const Post = require('./post');
const trackingIdKey = 'tracking_id';
const moment = require('moment-timezone');

function handle(req, res) {
  const cookies = new Cookies(req, res);
  const trackingId = addTrackingCookie(cookies, req.user);

  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll({ order: [['id', 'DESC']] }).then((posts) => {
        posts.forEach((post) => {
          post.content = post.content.replace(/\+/g, ' ');
          post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
        });
        res.end(pug.renderFile('./views/posts.pug', {
          posts: posts,
          user: req.user
        }));
        console.info(
          `閲覧されました: user: ${req.user}, ` +
          `trackingId: ${trackingId}, ` +
          `remoteAddress: ${req.connection.remoteAddress}, ` +
          `userAgent: ${req.headers['user-agent']}`
        );
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
          trackingCookie: trackingId,
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
          if (req.user === post.postedBy || req.user === 'admin') {
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
      break;
  }
}

/**
 * @param {Cookies} cookies
 * @param {String} userName
 * @param {String} トラッキングID
 */

function addTrackingCookie(cookies, userName) {
  const requestedTrackingId = cookies.get(trackingIdKey);
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId;
  } else {
    const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
    const trackingId = originalId + '_' + createValidHash(originalId, userName);
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
  }
}

function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  const splitted = trackingId.split('_');
  const originalId = splitted[0];
  const requestedHash = splitted[1];
  return createValidHash(originalId, userName) === requestedHash;
}

const secretKey =
  'd7c76f3c346a0ec283d674786e185186adfc1a41dd4d9a6def06a08c7ed4862913624e68030dc3c1f30c0e7ee64912dacfd4c658f598aa999744f2b2868d39e9acdf4d888e0a896b4956828428c617c75030a5e0f982f578dcc74fe54c0feaf8a3f93a0604a9efb6413718372e3082fde9ecf5a68bed283cc61ae2939fef49bd890f6fcda885ba751e058c42afaaa55254b3f55bb482aa96039a583bbfb9ddef5fc4121b207004e12c8787994995758bd3be6c308a803137f942ad12c9b4935fd372ddaca3589643fbe82393175fda775124c862671812b063c87fffe5af839abf9dc95b58711408259be98919630a23a370144aefa8feb5b96499cfcd0b50fe' +
  '3b2c93f5b9d9a2641be1b19ade3b5d7bdd3b705481f6ca9465e209c830383be0e810d7e4482afe040b74df07413d1653c290cf886c9cc5a4a3fe587ef6355bffb79eebd08d33026f268cc33e9cc1b3eb95921df5a198dc0047deb0b2488e2dcca6daf9f084c0275faed58eb6f453b0cc572e68a0ee59754a1b545f07882fb9e434727a5f87c85712936fb6b95330fdc432415c6b846bee5e8cc2404415d9a89b0bfcce9e9d41af67c0c4675f7183031b50680ee39a059cb0f6c602685faca029080419bccfaa5b6607eff751c5504b1cb360afb4f2f4e59d22dfe867dcb2edea32892340618493ddfa0e1929de90f1ebbae01dbbfd335a5010266fb9f2769c36' +
  '775d64d787732b22ee1459ad5a6e54e9500c8e0b613e95bb142adbad3cfb4ed7e1f9c1a59bcbbbb566238ae1411541dd8b08fd53308461ce3bd5502f84eac65f077e4c05a66bfa7db84157e35f3aa3e91735a3c5a8a154e8ab67adf80804f78aa147b4982f0dc9ad8ea19d38aa301b01272a5797bf2ac3becfdc449ba401215d2760c0f68341dce3e279dae4526c77d83d629e807782ca32e74583e280d23a8a0d51516b323493da172560fa3ebf6c5460dc61c62d2a4bf8d12e8e298a67fe9e10fa54386512b9ce7f5037106677805fc624d6defed487b1d17904c812259901274fdabc6ed3ea0d57cbb4aad049bc59ba93e7be2e5172231ed748caaaf332e5' +
  'd102c16220b8d9e9fb1b688e40462a58bfbeb8b65471b4d344881ab1b4a6eefade2998936142b1050e6293231b52cf12f06d9f23e5ca9509813e60169d5312f09b19c87edd809a3c27020eb959fcf8cf8dd5b6134d17e0b04960e2913bce3927bc53e81f0e1fafd52ff5ac25664afa825ce21506a40372ac2dd0471ad1e923dd3ffa9b338b0e6048dbaab0e1bda39f5b8a8cb3add09b2f5bbeb092d2aa23a45c5f9b19caa2452dda8f3c6df8c1d0ef6b3a7338a7fdd5bc5d8a58ce72897e2fdeb3fcd449ed4163ae85a282beaa695c74f3bcde0e2a3371460f763df7171d4cfa965df2ac3d583c8f5dcaaadd187c310ffafc6d926ac3b4f1846d3c692685daa0' +
  'e7af615e85f4b0f70d6aa58d6b28726133de5dbb11c55ea4b988cf705eaaa4df1077c44d749c1947b2afe005803360a05813c915eccb54026114d1ae3c549865465a622151f213fb7f1adcc5d0ceaf2deef055b94c6ba0834dc369b2d958ef2aaca18fe48a37f7d8d01e82bf9d2dd0ceedb5449153090d23412ec0e3f7aca4df9343b7caada9fcb64cf2ed6615f4fa78ecd7b2521e37d78de76ecb3fb645df809219bd3f408a94280d7b601b18935b493908a1b52ab2b94052ef7f8d1182a294b9b6bf313752fc73a16db5adf43c78d6d55569cc2fa9dcb425c4b4ad46f7478420771b29ec0c72e90cd171d6db20766a3a4cf6bced45d3fd0bb944814713372c' +
  '7ad9c20e09112c95071fe0a024e7bf6ecf17f74f76e83403ace46a0b03ce9758189884611779c2472983dadbd264da7afb46c3254a0983d7fb0680c4c3ceb9b42767131d8a4525cc1f32fbcabbfee9c7e93117567d355f6a3870b09b06dc49ec6d22e74288d096fb8091e6c81e8abc084dbab68a72bdff5f01a4513e3ae43f8bae1d773a2e5b2ce7b7c9093dd09541ce45930eb0d7e73374c0e5625a9fb75dde0d31c86772e30393e860eb33ed4d41c7747f631c7ff32a90c0ed8724fa230223c7d15122ad9600602d1459b85f96d2f18ef8ce8194064f32b1a343bef45b3da5f93d5f5f346618f9d0b9052749f0dc631e922c90f60bc97e1d62cb47af1141b9' +
  '073cb013a38aa1b03b8e5585292b0e7c2e0cc6479ec342595120ca739f9f46835531dbba2584f3809e96a30fe2bd0a8ad869480d3638a3f925529786c597ba58f6819120984424940d32365d6306690ff65d19ca871859c213813355c8cde892a020d52093d2391afc6494ce1d38e07fdbf03193a0774400dae7a0eb5668b3e14085cb302d8677b8923c4d8f7529b4736262f53f0325d8c9077bf86afcbc32a4c09713d5799b4a203db886f07385cb1392236ee2e5a715f84c479be8e9dd5941a07811378c4397e3b966ff6be4ae7d911460dbcccbf85dc5a2b485726df8977fc79fb1f7fd347eaf7f2336b466f7ed9d27c77cc6b112ff1e64edc9c959e07d6c' +
  '37993861838260ba8a8a6fb7c1b0578f8027d6acd177b95c12a8d1660d1308a48d91f3d2b8f5b393764be719210c9c5844346b731bd2ebdf881147653c88da89bba0f3c2bd19df54055f5595bdc8b6f4a33e0f6bf3bcdea103718ca4356fc60a29e359fada17eafe1026ac6273ad8a4ae743f91f0130650e0137875d6f373e77b4818a35ddd55b619096d03088e16f5793bab0b7e490dfbca2cd0b5d81cbfdc3dd4ee1678301b3ca1cc8439f526189db0166e055f92a1a0781fe26d91ef66016dc05c8f3ab7ed39e64c1287ccf31eb2264e7f154ca5eb7dcae93392fdb105df0f1cde9cd67defe6327f95a3ff487b2cc41c06f1db0fe53ebc7f75e9368b3fedc';

function createValidHash(originalId, userName) {
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(originalId + userName + secretKey);
  return sha1sum.digest('hex');
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