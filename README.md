# talescape
 The community-driven hub of interactive tales

## TODO

- [x] Make it deploy (Vercel)
- [x] Scaffold basic UI with mock data
- [x] Route structure
- [x] Tidy up build process
- [x] Set up a database (Vercel PostgreSQL)
- [x] Attach database to UI
- [x] Add authentication (w/ clerk)
- [x] Add image upload
- [x] "taint" (server-only)
- [x] Use Next/Image component
- [x] Error management (w/ Sentry)
- [ ] Routing/image page (parallel route)
- [ ] Delete button (w/ Server Actions)
- [ ] Analytics (PostHog)
- [ ] Ratelimiting (Upstash)
- [ ] Re-enable ESLint and TypeScript checks in build
- [x] Fix the sign-in/signup modal having issues
- [x] Test react-grab
- [ ] (Iphone) Reader mobile debug input zoom can leave tale layout unadjusted; consider preventing page zoom or forcing reader layout refresh after focus/zoom changes
- [x] Reader touch dragging scroll still has snapping/positioning bugs
- [ ] Reader horizontal sections should support same-height progression instead of requiring vertical scroll distance to move left/right through the next section
- [ ] Reader transition into/out of horizontal sections should linger at the first/last horizontal block before horizontal movement takes over
- [ ] Reader section-transition boundaries can become very janky when scrolling across the lines between sections
- [ ] Reader drag direction should account for section direction, including seamless left-direction sections that invert horizontal drag intent
- [ ] Reader mobile white-space/layout gaps in Chrome and Safari; Firefox looks less affected, likely section measurement or GSAP refresh timing

- [ ] Define proper HTML elements for tale reader components