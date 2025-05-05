import got from 'got';
import { CookieJar } from 'tough-cookie';
import type { CookieInstance, SsoKemdikbudTypes } from './types/index.js';

/**
 * @class SsoKemdikbud
 */
export class SsoKemdikbud {
	protected cookie: CookieJar;

	/**
	 * @constructor
	 * @param options SSO Kemdikbud Wrapper Options
	 */
	constructor(protected readonly options: SsoKemdikbudTypes.ConstructorOptions) {
		options.ssoBaseUrl ??= 'https://sso.data.kemdikbud.go.id';
		this.cookie =
			options.cookieJar instanceof CookieJar
				? options.cookieJar
				: new CookieJar(options.cookieJar.store, options.cookieJar.options);
	}

    /**
     * Login to the kemdikbud service
     * @param appKey Kemdikbud Service App Key
     * @param credentials Your school credentials
     * @return {Promise<string | undefined>} Service URL
     */
	async login(appKey: string, credentials: SsoKemdikbudTypes.Credentials): Promise<string | undefined> {
		const response = await got(this.buildUrl(appKey), {
			cookieJar: this.cookie,
			throwHttpErrors: false,
		});

		if (response.statusCode !== 200) {
			return undefined;
		}

		const postResponse = await got.post(this.buildUrl(appKey), {
			form: {
				email: credentials.email,
				password: credentials.password,
				appkey: appKey,
				csrf_token: '',
			},
			cookieJar: this.cookie,
			throwHttpErrors: false,
			followRedirect: false,
		});

		if (postResponse.statusCode === 200) {
			return undefined;
		}

		const newUrl = postResponse.headers.location;
		if (!newUrl) {
			return undefined;
		}

		const serviceResponse = await got(newUrl, {
			cookieJar: this.cookie,
			throwHttpErrors: false,
            https: {
                rejectUnauthorized: false,
            },
		});

        if (serviceResponse.headers['set-cookie']?.length && serviceResponse.statusCode === 200) {
            return serviceResponse.requestUrl.origin;
        }

        return undefined;
	}

    /**
     * Save current cookie jar state
     * @param cookieInstance Cookie instance
     */
	async save(cookieInstance: CookieInstance): Promise<void> {
		cookieInstance.store(await this.cookie.serialize());
	}

    /**
     * Build URL from appKey
     * @param appKey App Service Key
     * @return {URL}
     */
	protected buildUrl(appKey: string): URL {
		const url = new URL('./sys/login', this.options.ssoBaseUrl);
		url.searchParams.set('appkey', appKey);

		return url;
	}
}
