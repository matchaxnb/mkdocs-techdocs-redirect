import { DockerContainerRunner } from '@backstage/backend-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  createRouter,
  Generators,
  Preparers,
  Publisher,
  RouterOptions,
  TechDocsMetadata,
} from '@backstage/plugin-techdocs-backend';
import Docker from 'dockerode';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

type TechDocsMetadataExt = TechDocsMetadata & {
  redirects?: { [key: string]: string };
};

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
        let target = redirects[key];
        if (!(target.startsWith('http://') || target.startsWith('https://'))) {
          target = `${target}/index.html`
        }
        if (req.url == fullFormedSrc) {
          req.url = target;
          logger.debug(`Found a redirection from ${key} to ${target}`);
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
  router.use('', sourceRouter);
  return router;
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // Preparers are responsible for fetching source files for documentation.
  const preparers = await Preparers.fromConfig(env.config, {
    logger: env.logger,
    reader: env.reader,
  });

  // Docker client (conditionally) used by the generators, based on techdocs.generators config.
  const dockerClient = new Docker();
  const containerRunner = new DockerContainerRunner({ dockerClient });

  // Generators are used for generating documentation sites.
  const generators = await Generators.fromConfig(env.config, {
    logger: env.logger,
    containerRunner,
  });

  // Publisher is used for
  // 1. Publishing generated files to storage
  // 2. Fetching files from storage and passing them to TechDocs frontend.
  const publisher = await Publisher.fromConfig(env.config, {
    logger: env.logger,
    discovery: env.discovery,
  });

  // checks if the publisher is working and logs the result
  await publisher.getReadiness();
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
