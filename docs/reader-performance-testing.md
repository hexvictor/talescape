# Reader Performance Testing

## Unit Tests

Run the geometry and engine behavior tests:

```bash
pnpm test
```

Run them continuously while editing:

```bash
pnpm test:watch
```

Generate an HTML coverage report in `coverage/index.html`:

```bash
pnpm test:coverage
```

## Browser Performance Test

Install the browser binaries once:

```bash
pnpm exec playwright install chromium firefox
```

Start Talescape in a separate terminal, then run:

```bash
pnpm test:performance
```

Use another running URL when needed:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url pnpm test:performance
```

The report records:

- `maxFrameGapMs`: largest delay between animation frames. Repeated gaps over 50 ms are visible; gaps over 100 ms feel severe.
- `longTasks`: main-thread tasks longer than 50 ms.
- `maxMountedBlocks`: highest number of mounted block articles during the run.
- `offscreenAnimations`: animations still marked as playing outside the visible viewport.

Open the Playwright HTML report:

```bash
pnpm exec playwright show-report
```

## Firefox Profiler

1. Open Firefox Developer Tools and select **Performance**.
2. Record while reproducing one exact interaction, such as 10 fast wheel bursts.
3. Stop recording and inspect **Call Tree**, **Flame Graph**, and **Stack Chart**.
4. Sort the Call Tree by **Total Time** to find expensive parent operations.
5. Enable **Invert Call Stack** to find expensive leaf functions regardless of who called them.
6. Check **Screenshots**, **Frames**, and **Network** for image decode or repaint spikes.
7. Export the profile as JSON or share the profiler URL together with the exact interaction and device details.

High scripting time points to engine/store work. High rendering or painting time points to layout, filters, large images, or too many visible layers. Increasing memory and listener counts after repeated navigation usually indicates retained DOM references or missing cleanup.
