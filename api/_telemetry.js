// Sends per-request log entries to our self-hosted Vercel-Drain receiver
// (Hobby plan does not support native Log Drains).
//
// File prefix `_` keeps Vercel from routing this as its own function.
//
// Required env vars (set in Vercel dashboard → Settings → Environment Variables):
//   VERCEL_DRAIN_BEARER  bearer secret expected by horus.xinfty.space/vercel-drain
//   DRAIN_URL            optional override of the drain endpoint
//
// Available out of the box on Vercel: VERCEL_ENV, VERCEL_REGION,
// VERCEL_DEPLOYMENT_ID (we use VERCEL_URL as a fallback), VERCEL_PROJECT_PRODUCTION_URL.

const DEFAULT_DRAIN_URL = 'https://horus.xinfty.space/vercel-drain';
const FETCH_TIMEOUT_MS = 2000;

async function postLog(req, statusCode, t0) {
    const bearer = process.env.VERCEL_DRAIN_BEARER;
    if (!bearer) return;

    const drainUrl = process.env.DRAIN_URL || DEFAULT_DRAIN_URL;
    const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const clientIp = xff || req.headers['x-real-ip'] || '';

    const payload = [{
        id: `${t0}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: t0,
        source: 'lambda',
        host: req.headers.host || 'public',
        projectName: 'public',
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || '',
        environment: process.env.VERCEL_ENV || 'development',
        executionRegion: process.env.VERCEL_REGION || 'local',
        level: statusCode >= 500 ? 'error' : 'info',
        message: `${req.method} ${req.url} → ${statusCode} (${Date.now() - t0}ms)`,
        proxy: {
            timestamp: t0,
            method: req.method,
            host: req.headers.host || '',
            path: req.url,
            userAgent: [req.headers['user-agent'] || ''],
            referer: req.headers.referer || req.headers.referrer || '',
            region: process.env.VERCEL_REGION || 'local',
            statusCode,
            clientIp,
            scheme: 'https',
            vercelCache: 'BYPASS'
        }
    }];

    try {
        await fetch(drainUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
        });
    } catch (_) {
        // best-effort; never fail the user-facing response because of telemetry
    }
}

export function withTelemetry(handler) {
    return async (req, res) => {
        const t0 = Date.now();
        let statusCode = 200;

        const origStatus = res.status?.bind(res);
        if (origStatus) {
            res.status = (code) => {
                statusCode = code;
                return origStatus(code);
            };
        }

        const origSend = res.send?.bind(res);
        if (origSend) {
            res.send = async function (body) {
                await postLog(req, statusCode, t0);
                return origSend(body);
            };
        }

        return handler(req, res);
    };
}
