import { LemonButton } from '@posthog/lemon-ui'
import { useValues } from 'kea'
import { BridgePage } from 'lib/components/BridgePage/BridgePage'
import { BuilderHog2, SurprisedHog } from 'lib/components/hedgehogs'
import { Spinner } from 'lib/components/Spinner/Spinner'
import { SceneExport } from 'scenes/sceneTypes'
import { verifyEmailLogic } from './verifyEmailLogic'

export const scene: SceneExport = {
    component: VerifyEmail,
    logic: verifyEmailLogic,
}

export function VerifyEmail(): JSX.Element {
    const { view } = useValues(verifyEmailLogic)

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-full">
                <BridgePage view="verifyEmail" fixedWidth={false} className="VerifyEmailContent">
                    <div className="px-12 py-8 text-center flex flex-col items-center max-w-200">
                        {view === 'pending' ? (
                            <>
                                <h1 className="text-xl">Welcome to PostHog!</h1>
                                <h1 className="text-3xl font-bold">Let's verify your email address.</h1>
                                <div className="max-w-80 mb-12">
                                    <BuilderHog2 className="w-full h-full" />
                                </div>
                                <p>
                                    An email has been sent to with a link to verify your email address. If you have not
                                    received the email in a few minutes, please check your spam folder.
                                </p>
                                <LemonButton type="secondary" className="mt-8" to={'mailto:hey@posthog.com'}>
                                    Contact Support
                                </LemonButton>
                            </>
                        ) : view === 'verify' ? (
                            <>
                                <Spinner className="text-4xl mb-12" />
                                <p>Verifying your email address...</p>
                            </>
                        ) : view === 'invalid' ? (
                            <>
                                <h1 className="text-3xl font-bold">Whoops!</h1>
                                <div className="max-w-60 mb-12">
                                    <SurprisedHog className="w-full h-full" />
                                </div>
                                <p>Seems like that link isn't quite right. Try again?</p>
                                <LemonButton type="secondary" className="mt-8" to={'mailto:hey@posthog.com'}>
                                    Contact Support
                                </LemonButton>
                            </>
                        ) : (
                            <Spinner className="text-4xl" />
                        )}
                    </div>
                </BridgePage>
            </div>
        </div>
    )
}
