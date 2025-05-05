import {SsoKemdikbud} from '../dist/index.js';
import {CookieFileConsumer} from '../dist/utils/cookies-file-loader.js';

(async () => {
    const cookieConsumer = new CookieFileConsumer('/tmp/sso');
    await cookieConsumer.initIfNotExists();

    const sso = new SsoKemdikbud({
        cookieJar: await cookieConsumer.load(),
    });

    const serviceUrl = await sso.login('348310F2-0262-4F5D-B7D1-41F92ECDCA93', {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
    });

    console.log(serviceUrl);
    if (serviceUrl) {
        await sso.save(cookieConsumer);
    }
})();
