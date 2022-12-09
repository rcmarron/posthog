import { EventName } from './EventName'
import { PropertyFilters } from 'lib/components/PropertyFilters/PropertyFilters'
import { Tooltip } from 'lib/components/Tooltip'
import { URL_MATCHING_HINTS } from 'scenes/actions/hints'
import { Col, Radio, RadioChangeEvent } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { ActionStepType } from '~/types'
import { LemonButton, LemonInput, LemonTextArea, Link } from '@posthog/lemon-ui'
import { IconClose, IconOpenInApp } from 'lib/components/icons'
import { LemonDialog } from 'lib/components/LemonDialog'
import { AuthorizedUrlList } from 'lib/components/AuthorizedUrlList/AuthorizedUrlList'
import { AuthorizedUrlListType } from 'lib/components/AuthorizedUrlList/authorizedUrlListLogic'
import { LemonLabel } from 'lib/components/LemonLabel/LemonLabel'

const learnMoreLink = 'https://posthog.com/docs/user-guides/actions?utm_medium=in-product&utm_campaign=action-page'

interface Props {
    step: ActionStepType
    actionId: number
    isOnlyStep: boolean
    index: number
    identifier: string
    onDelete: () => void
    onChange: (step: ActionStepType) => void
}

export function ActionStep({ step, actionId, isOnlyStep, index, identifier, onDelete, onChange }: Props): JSX.Element {
    const sendStep = (stepToSend: ActionStepType): void => {
        onChange(stepToSend)
    }

    return (
        <Col span={24} md={12}>
            <div className="rounded border p-4 relative h-full">
                {index > 0 && <div className="stateful-badge pos-center-end or">OR</div>}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <b>Match Group #{index + 1}</b>

                        {!isOnlyStep && (
                            <LemonButton
                                status="primary-alt"
                                icon={<IconClose />}
                                size="small"
                                aria-label="delete"
                                onClick={onDelete}
                            />
                        )}
                    </div>
                    {<TypeSwitcher step={step} sendStep={sendStep} />}

                    {step.event === '$autocapture' && (
                        <AutocaptureFields step={step} sendStep={sendStep} actionId={actionId} />
                    )}
                    {step.event != null && step.event !== '$autocapture' && step.event !== '$pageview' && (
                        <div className="space-y-1">
                            <LemonLabel>Event name</LemonLabel>
                            <EventName
                                value={step.event}
                                onChange={(value) =>
                                    sendStep({
                                        ...step,
                                        event: value || '',
                                    })
                                }
                            />

                            <small>
                                <Link to="https://posthog.com/docs/libraries" target="_blank">
                                    See documentation
                                </Link>{' '}
                                on how to send custom events in lots of languages.
                            </small>
                        </div>
                    )}
                    {step.event === '$pageview' && (
                        <div>
                            <Option
                                step={step}
                                sendStep={sendStep}
                                item="url"
                                extra_options={<URLMatching step={step} sendStep={sendStep} />}
                                label="URL"
                            />
                            {step.url_matching && step.url_matching in URL_MATCHING_HINTS && (
                                <small>{URL_MATCHING_HINTS[step.url_matching]}</small>
                            )}
                        </div>
                    )}

                    {step.event && (
                        <div className="mt-6 space-y-2">
                            <h3>Filters</h3>
                            {(!step.properties || step.properties.length === 0) && (
                                <div className="text-muted">This match group has no additional filters.</div>
                            )}
                            <PropertyFilters
                                propertyFilters={step.properties}
                                pageKey={identifier}
                                eventNames={step.event ? [step.event] : []}
                                onChange={(properties) => {
                                    sendStep({
                                        ...step,
                                        properties: properties as [],
                                    })
                                }}
                                showConditionBadge
                            />
                        </div>
                    )}
                </div>
            </div>
        </Col>
    )
}

function Option(props: {
    step: ActionStepType
    sendStep: (stepToSend: ActionStepType) => void
    item: keyof Pick<ActionStepType, 'href' | 'text' | 'selector' | 'url'>
    label: JSX.Element | string
    placeholder?: string
    caption?: JSX.Element | string
    extra_options?: JSX.Element | string
}): JSX.Element {
    const onOptionChange = (val: string): void =>
        props.sendStep({
            ...props.step,
            [props.item]: val || null, // "" is a valid filter, we don't want it
        })

    return (
        <div className="space-y-1">
            <LemonLabel>
                {props.label} {props.extra_options}
            </LemonLabel>
            {props.caption && <div className="action-step-caption">{props.caption}</div>}
            {props.item === 'selector' ? (
                <LemonTextArea
                    onChange={onOptionChange}
                    value={props.step[props.item] || ''}
                    placeholder={props.placeholder}
                />
            ) : (
                <LemonInput
                    data-attr="edit-action-url-input"
                    allowClear
                    onChange={onOptionChange}
                    value={props.step[props.item] || ''}
                    placeholder={props.placeholder}
                />
            )}
        </div>
    )
}

const AndSeparator = (): JSX.Element => {
    return (
        <div className="text-center my-2">
            <span className="stateful-badge and">AND</span>
        </div>
    )
}

function AutocaptureFields({
    step,
    actionId,
    sendStep,
}: {
    step: ActionStepType
    sendStep: (stepToSend: ActionStepType) => void
    actionId: number
}): JSX.Element {
    const onSelectElement = (): void => {
        LemonDialog.open({
            title: 'Select an element',
            description: actionId
                ? 'Choose the domain on which to edit this action'
                : 'Choose the domain on which to create this action',
            content: (
                <>
                    <AuthorizedUrlList actionId={actionId} type={AuthorizedUrlListType.TOOLBAR_URLS} />
                </>
            ),
            primaryButton: {
                children: 'Close',
                type: 'secondary',
            },
        })
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <LemonButton size="small" type="secondary" onClick={onSelectElement} sideIcon={<IconOpenInApp />}>
                    Select element on site
                </LemonButton>
                <Link to={`${learnMoreLink}#autocapture-based-actions`} target="_blank">
                    See documentation.
                </Link>
            </div>
            <Option
                step={step}
                sendStep={sendStep}
                item="href"
                label="Link target equals"
                caption={
                    <>
                        If your element is a link, the location that the link opens (<code>href</code> tag)
                    </>
                }
            />
            <AndSeparator />
            <Option
                step={step}
                sendStep={sendStep}
                item="text"
                label="Text equals"
                caption="Text content inside your element"
            />
            <AndSeparator />
            <Option
                step={step}
                sendStep={sendStep}
                item="selector"
                label={
                    <>
                        HTML selector matches
                        <Tooltip title="Click here to learn more about supported selectors">
                            <Link to={`${learnMoreLink}#matching-selectors`} target="_blank">
                                <InfoCircleOutlined />
                            </Link>
                        </Tooltip>
                    </>
                }
                placeholder='button[data-attr="my-id"]'
                caption={
                    <span>
                        CSS selector or an HTML attribute that ideally uniquely identifies your element. Example:{' '}
                        <code className="code">[data-attr="signup"]</code>
                    </span>
                }
            />
            <AndSeparator />
            <Option
                step={step}
                sendStep={sendStep}
                item="url"
                extra_options={<URLMatching step={step} sendStep={sendStep} />}
                label="Page URL"
                caption="Elements will match only when triggered from the URL (particularly useful if you have non-unique elements in different pages)."
            />
            {step?.url_matching && step.url_matching in URL_MATCHING_HINTS && (
                <small>{URL_MATCHING_HINTS[step.url_matching]}</small>
            )}
        </div>
    )
}

function TypeSwitcher({
    step,
    sendStep,
}: {
    step: ActionStepType
    sendStep: (stepToSend: ActionStepType) => void
}): JSX.Element {
    const handleChange = (e: RadioChangeEvent): void => {
        const type = e.target.value
        if (type === '$autocapture') {
            sendStep({ ...step, event: '$autocapture' })
        } else if (type === 'event') {
            sendStep({ ...step, event: '' })
        } else if (type === '$pageview') {
            sendStep({
                ...step,
                event: '$pageview',
                url: step.url,
            })
        }
    }

    return (
        <div className="type-switcher">
            <Radio.Group
                buttonStyle="solid"
                onChange={handleChange}
                value={
                    step.event === '$autocapture' || step.event === '$pageview' || step.event === undefined
                        ? step.event
                        : 'event'
                }
            >
                <Radio.Button value="$autocapture">Autocapture</Radio.Button>
                <Radio.Button value="event">Custom event</Radio.Button>
                <Radio.Button value="$pageview">Page view</Radio.Button>
            </Radio.Group>
        </div>
    )
}

function URLMatching({
    step,
    sendStep,
}: {
    step: ActionStepType
    sendStep: (stepToSend: ActionStepType) => void
}): JSX.Element {
    const handleURLMatchChange = (e: RadioChangeEvent): void => {
        sendStep({ ...step, url_matching: e.target.value })
    }
    return (
        <Radio.Group
            buttonStyle="solid"
            onChange={handleURLMatchChange}
            value={step.url_matching || 'contains'}
            size="small"
        >
            <Radio.Button value="contains">contains</Radio.Button>
            <Radio.Button value="regex">matches regex</Radio.Button>
            <Radio.Button value="exact">matches exactly</Radio.Button>
        </Radio.Group>
    )
}
