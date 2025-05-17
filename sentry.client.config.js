import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: "https://974a1f23236df375695263e74c607086@o4509101041975296.ingest.de.sentry.io/4509101140344912",

	integrations: [Sentry.replayIntegration()],
	// Session Replay
	replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
