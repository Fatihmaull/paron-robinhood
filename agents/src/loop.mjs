export function startLoop({ intervalMs, tick, log, schedule = setInterval, clear = clearInterval, on = (signal, fn) => process.on(signal, fn) }) {
  let timer = null;
  let stopped = false;
  const stop = (signal) => {
    if (stopped) return;
    stopped = true;
    if (timer != null) clear(timer);
    timer = null;
    log.info("shutdown", { signal });
    if (signal === "SIGINT" || signal === "SIGTERM") process.exit(0);
  };
  const safeTick = () => {
    if (stopped) return;
    Promise.resolve()
      .then(tick)
      .catch((err) => {
        if (!stopped) log.error("tick.failed", { error: err instanceof Error ? err.message : String(err) });
      });
  };
  timer = schedule(safeTick, intervalMs);
  on("SIGINT", () => stop("SIGINT"));
  on("SIGTERM", () => stop("SIGTERM"));
  return {
    stop: () => stop("stop"),
    get stopped() {
      return stopped;
    },
  };
}
