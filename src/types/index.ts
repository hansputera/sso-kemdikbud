import type { CookieJar, CreateCookieJarOptions, Nullable, Store } from 'tough-cookie';

export namespace SsoKemdikbudTypes {
	export type Credentials = {
		email: string;
		password: string;
	};

	export type ConstructorOptions = {
		cookieJar:
			| {
					store: Nullable<Store>;
					options: CreateCookieJarOptions;
			  }
			| CookieJar;
		ssoBaseUrl?: string;
	};
}

export type CookieInstance = {
	load: <T>() => Promise<T>;
	store: <Value>(value: Value) => Promise<boolean> | boolean;
	initIfNotExists: () => Promise<void>;
};
