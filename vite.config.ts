import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  ssr: {
    // Wonderflow's published ESM entry uses directory re-exports that Node's
    // SSR loader can't resolve when left external. Bundle it, along with
    // constate, to preserve interop during both dev and build.
    noExternal: ["@wonderflow/react-components", "@wonderflow/themes", "constate"],
  },
  optimizeDeps: {
    // Pre-bundle Wonderflow for the browser dev server.
    include: ["@wonderflow/react-components", "@wonderflow/themes"],
  },
});
