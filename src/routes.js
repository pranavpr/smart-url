import { name, version } from '../package.json';
import Router from 'koa-router';
import useragent from 'useragent';
import shortid from 'shortid';
import redisService from './redisService';

const router = new Router();

/**
 * Get /
 */
router.get('/', async ctx => {
  ctx.body = {
    app: name,
    version: version,
    ua: useragent.parse(ctx.header['user-agent'])
  };
});

/**
 * Get all URLs for an id
 */

router.get('/urls/:id', async ctx => {
  const id = ctx.params.id;
  const result = JSON.parse(await redisService.getURL(id));
  ctx.body = {
    id,
    urls: result.urls
  };
});

/**
 * Create URL
 */

router.post('/urls', async ctx => {
  const id = shortid.generate();
  const payload = ctx.request.body;
  const result = await redisService.setURL(id, JSON.stringify(payload));
  if (result === 'OK') {
    ctx.body = {
      id,
      urls: payload.urls
    };
  } else {
    throw new Error('Unable to save URL');
  }
});

/**
 * Redirect to URL based on OS
 */

router.get('/:id', async ctx => {
  const id = ctx.params.id;
  const ua = useragent.parse(ctx.header['user-agent']);
  const result = JSON.parse(await redisService.getURL(id));
  if (result && result.urls) {
    switch (ua.os.family) {
      case 'Android':
        ctx.redirect(result.urls.playstore);
        break;
      case 'iOS':
        ctx.redirect(result.urls.appstore);
        break;
      default:
        ctx.redirect(result.urls.web);
        break;
    }
  } else {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
});

export default router;
