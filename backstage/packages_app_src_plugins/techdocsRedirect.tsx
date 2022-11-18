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