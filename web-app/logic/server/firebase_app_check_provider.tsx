export default function mock() {}

//import { AppCheckProvider, useFirebaseApp } from 'reactfire';
/*
TODO: Implementa AppCheck
// https://makerkit.dev/blog/tutorials/secure-firebase-appcheck
//https://stackoverflow.com/questions/69521649/how-to-use-firebase-app-check-in-react-403-error#:~:text=Go%20to%20the%20Firebase%20Console,debug%20token%20in%20the%20popup.
//https://firebase.google.com/docs/app-check/web/recaptcha-provider?hl=en
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

async function useFetch<Resp = unknown>(
    url: string,
    payload: string,
    method = 'POST',
    headers?: StringObject
) {
    const options: RequestInit = {
        method,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            ...(headers ?? {}),
        },
    };

    const getAppCheckToken = useGetAppCheckToken();
    const token = await getAppCheckToken();

    // if the app-check token was found
    // we add the header to the API request
    if (token) {
        headers['X-Firebase-AppCheck'] = token;
    }

    try {
        const response = await fetch(url, options);

        if (response.ok) {
            return (await response.json()) as Promise<Resp>;
        }

        return Promise.reject(response.statusText);
    } catch (e) {
        return Promise.reject(e);
    }
}

const FIREBASE_APPCHECK_HEADER =
    'X-Firebase-AppCheck';

export async function withAppCheck(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const appCheck = getAppCheck();
    const token =
        req.headers[FIREBASE_APPCHECK_HEADER];

    const forbidden = () => forbiddenException(res);

    if (!token || typeof token !== 'string') {
        return forbidden();
    }

    try {
        await appCheck.verifyToken(token);
    } catch (e) {
        return forbidden();
    }
}

function attachAppCheckDebugToken() {
    const token =
        process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;

    Object.assign(window, {
        FIREBASE_APPCHECK_DEBUG_TOKEN: token,
    });
}

function useGetAppCheckToken() {
    // instead of using useAppCheck()
    // we manually request the SDK
    // because we *may not have initialized it*
    const sdk = useContext(AppCheckSdkContext);

    return useCallback(async () => {
        try {
            // if the SDK does not exist, we cannot generate a token
            if (!sdk) {
                return;
            }

            const forceRefresh = false;

            const { token } =
                await getToken(sdk, forceRefresh);

            return token;
        } catch (e) {
            return;
        }
    }, [sdk]);
}

const FirebaseAppCheckProvider: React.FCC = ({ children }) => {
    const siteKey =
        process.env.NEXT_PUBLIC_APPCHECK_KEY;

    const app = useFirebaseApp();

    if (!siteKey || !isBrowser() || configuration.emulator) {
        return <>{children}</>;
    }

    if (!configuration.production) {
        attachAppCheckDebugToken();
    }

    const provider =
        new ReCaptchaV3Provider(siteKey);

    const sdk = initializeAppCheck(app, {
        provider,
        isTokenAutoRefreshEnabled: true,
    });

    return <AppCheckProvider sdk={sdk}>{children}</AppCheckProvider>;
};

export default FirebaseAppCheckProvider;
*/