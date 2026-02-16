import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except API, static files, and Next.js internals
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
