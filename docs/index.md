# mkdocs-techdocs-redirect

This is a plug-in for the TechDocs distribution of mkdocs that aims to make it possible to redirect old pages to new pages in TechDocs.

It aims to integrate quite simply in a TechDocs setup.


## How to use this?

Add this plug-in to the TechDocs image you use for building your TechDocs sites. You can find an example in `docs/examples` in the repository.

Then, you may start setting up redirects.

Imaging your "Tutorial" page becomes too big and you want to split it in 2 parts.

You will take the large file `tutorial.md` and split it to 2 files:

- `tutorial/01-getting-started.md`
- `tutorial/02-going-further.md`

But now, if you just do that, when people will access your old `tutorial` link, they will get a 404. You actually want them to end up on
the `tutorial/01-getting-started` page.

With this plug-in, you just need to do the following in your `mkdocs.yml` file

```yaml
# [ ... ]
plugins:
  - techdocs-core
  - redirects:
      redirect_maps:
        "tutorial": "tutorial/01-getting-started"
# [ ... ]
```

## Supporting this on the Backstage side

Change your `packages/backend/src/plugins/techdocs.ts` so that it reads like this:

```typescript

// this type extends TechDocsMetadata to add a redirects key-value map of redirections
type TechDocsMetadataExt = TechDocsMetadata & {
  redirects?: { [key: string]: string };
};

// this function creates a wrapping router for TechDocs
async function createRouterRedirects(options: RouterOptions): Promise<Router> {
  const router = Router();
  const { logger } = options;
  const publisher = options.publisher;
  // add middleware to handle redirects by processing an extra field of techdocs metadata

  router.use('/static/docs/:namespace/:kind/:name', async (req, _res, next) => {
    const { kind, namespace, name } = req.params;
    const entityName = { kind, namespace, name };
    try {
      const metadata = (await publisher.fetchTechDocsMetadata(
        entityName,
      )) as TechDocsMetadataExt;
      const redirects = metadata.redirects ?? {};
      for (const key in redirects) {
        const fullFormedSrc = `/${key}/index.html`;
        const fullFormedDst = `/${redirects[key]}/index.html`;
        if (req.url == fullFormedSrc) {
          req.url = fullFormedDst;
          logger.debug(`redirection found from ${key} to ${fullFormedDst}`);
          break;
        }
      }
    } catch (err) {
      logger.info(
        `Unable to get metadata for '${stringifyEntityRef(
          entityName,
        )}' with error ${err}`,
      );
    }
    next();
  });
  const sourceRouter = await createRouter(options);
  // delegate most of the work to the base sourceRouter
  router.use('', sourceRouter);
  return router;
}
```

and change the last lines of it to

```typescript
  // checks if the publisher is working and logs the result
  await publisher.getReadiness();
  // calling our createRouter wrapper
  return await createRouterRedirects({
    preparers,
    generators,
    publisher,
    logger: env.logger,
    config: env.config,
    discovery: env.discovery,
    cache: env.cache,
  });
}
```

This creates a very simple wrapper that does the redirection work for the TechDocs entities. It is non-intrusive
and will work nicely even if you do not use redirections yet.

## An operational example

Click [this link](redirection_example) (if you've imported this page in a Backstage instance with the extension setup). It will take you back to the right page.
