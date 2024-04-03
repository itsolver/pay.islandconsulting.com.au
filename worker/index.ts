// index.ts
import * as checkout from './checkout';
import type { ModuleWorker } from './types';

const worker: ModuleWorker = {
    async fetch(req, env, ctx) {
        const url = new URL(req.url);

        // Handle the intent to create a checkout session
        if (url.pathname.endsWith("/intent")) {
            return checkout.create(req, env, ctx);
        }
    }
}

export default worker;
