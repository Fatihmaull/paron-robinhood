import { createApp } from "./create-app.js";
import { loadSnapshot } from "./load-snapshot.js";

const app = createApp({ load: loadSnapshot });

export default app;
