import { actions, kea, path, reducers } from 'kea'

import { actionToUrl, urlToAction } from 'kea-router'
import equal from 'fast-deep-equal'
import { DataTableNode, Node, NodeKind } from '~/queries/schema'
import { urls } from 'scenes/urls'
import { objectsEqual } from 'lib/utils'
import { lemonToast } from 'lib/components/lemonToast'

import type { personsSceneLogicType } from './personsSceneLogicType'

const getDefaultQuery = (): DataTableNode => ({
    kind: NodeKind.DataTableNode,
    source: { kind: NodeKind.PersonsNode },
    columns: ['person', 'id', 'created_at', 'properties.$geoip_country_name', 'properties.$browser'],
    propertiesViaUrl: true,
    showSearch: true,
    showPropertyFilter: true,
    showExport: true,
    showReload: true,
})

export const personsSceneLogic = kea<personsSceneLogicType>([
    path(['scenes', 'persons', 'personsSceneLogic']),

    actions({ setQuery: (query: Node) => ({ query }) }),
    reducers({ query: [getDefaultQuery() as Node, { setQuery: (_, { query }) => query }] }),

    actionToUrl(({ values }) => ({
        setQuery: () => [
            urls.persons(),
            {},
            objectsEqual(values.query, getDefaultQuery()) ? {} : { q: values.query },
            { replace: true },
        ],
    })),

    urlToAction(({ actions, values }) => ({
        [urls.persons()]: (_, __, { q: queryParam }): void => {
            if (!equal(queryParam, values.query)) {
                // nothing in the URL
                if (!queryParam) {
                    // set the default unless it's already there
                    if (!objectsEqual(values.query, getDefaultQuery())) {
                        actions.setQuery(getDefaultQuery())
                    }
                } else {
                    if (typeof queryParam === 'object') {
                        actions.setQuery(queryParam)
                    } else {
                        lemonToast.error('Invalid query in URL')
                        console.error({ queryParam })
                    }
                }
            }
        },
    })),
])
