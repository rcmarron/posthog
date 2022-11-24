import { useActions, useValues } from 'kea'
import { dataNodeLogic } from '~/queries/nodes/dataNodeLogic'
import { LemonButton } from 'lib/components/LemonButton'
import { IconRefresh } from 'lib/components/icons'
import { Spinner } from 'lib/components/Spinner/Spinner'

export function ReloadQuery(): JSX.Element {
    const { responseLoading } = useValues(dataNodeLogic)
    const { loadData } = useActions(dataNodeLogic)

    return (
        <LemonButton
            type="secondary"
            onClick={loadData}
            disabled={responseLoading}
            icon={responseLoading ? <Spinner /> : <IconRefresh />}
        >
            {responseLoading ? 'Loading' : 'Reload'}
        </LemonButton>
    )
}
