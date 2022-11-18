# mkdocs-techdocs-redirect

This is a plug-in for the TechDocs distribution of mkdocs that aims to make it possible to redirect old pages to new pages in TechDocs.

It aims to integrate quite simply in a TechDocs setup.


## How to use this?

Add this plug-in to the TechDocs image you use for building your TechDocs sites. You can find an example in `docs/examples` in the repository.

Then, you may start setting up redirects.

Imaging your "Tutorial" page becomes too big and you want to split it in 2 parts.

You will take the large file `tutorial.md` and split it to 2 files:

- `tutorial-guide/01-getting-started.md`
- `tutorial-guide/02-going-further.md`

But now, if you just do that, when people will access your old `tutorial` link, they will get a 404. You actually want them to end up on
the `tutorial/01-getting-started` page.

With this plug-in, you just need to do the following in your `mkdocs.yml` file

```yaml
# [ ... ]
plugins:
  - techdocs-core
  - redirects:
      redirect_maps:
        "tutorial": "tutorial-guide/01-getting-started"
# [ ... ]
```

## Supporting this on the Backstage side

> **Note**: in the past we recommended using a backend mod to plugins/techdocs.ts. It is flaky and would not work so well. Don't.

Create a `packages/app/src/plugins/techdocsRedirect.tsx` module with this contents:

```tsx
import { createPlugin } from "@backstage/core-plugin-api";
import { createTechDocsAddonExtension, TechDocsAddonLocations, TechDocsMetadata, useTechDocsReaderPage } from "@backstage/plugin-techdocs-react";
import React from "react";
import { useParams } from "react-router";
import { AsyncState } from "react-use/lib/useAsyncFn";
import { Navigate } from 'react-router-dom'
const techdocsRedirectPlugin = createPlugin({
    id: 'techdocsRedirect'
})

type TechDocsMetadataExt = TechDocsMetadata & {
  redirects?: { [key: string]: string };
 }

const TechDocsRedirector = () => {
    const { metadata  } = useTechDocsReaderPage() 
    const params = useParams()
    const path = params['*'] ?? "";
    const redirects = (metadata as AsyncState<TechDocsMetadataExt>).value?.redirects??{};
    const target = redirects[path] ?? path;
    if (target == path) {
        return (<></>)
    }
    return (
    <Navigate to={target} />
    )
}

export const TechDocsRedirectExtension = techdocsRedirectPlugin.provide(
    createTechDocsAddonExtension({
        name: 'TechDocsRedirectExtension',
        location: TechDocsAddonLocations.Header,
        component: TechDocsRedirector,
    })
)
```

Then, add it as a dependency to your `App.tsx` and summon it in the TechDocsAddons

```tsx
// redirect extension for techdocs
import { TechDocsRedirectExtension } from './custom/techdocsRedirect';

// [...]
const routes = ( 
// [...]
        <TechDocsAddons>
            <ReportIssue />
            <TechDocsRedirectExtension />
        </TechDocsAddons>
```

Find the most up-to-date example [in the /backstage folder](/backstage/packages_app_src_plugins/techdocsRedirect.tsx).

## An operational example

Click [this link](redirection_example) (if you've imported this page in a Backstage instance with the extension setup). It will take you back to the right page.

## Limitations

Currently you cannot redirect a page to a subfolder with the same stub name.

For example, you cannot redirect `tutorial` to `tutorial/01-getting-started`. That's why we use `tutorial-guide/01-getting-started`
