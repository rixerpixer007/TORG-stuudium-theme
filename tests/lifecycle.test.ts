import { describe, expect, it, vi } from "vitest";

import { EnhancementRuntime, type EnhancementFeature } from "../src/shared/lifecycle";
import { detectStuudiumRoute } from "../src/shared/routes";

describe("EnhancementRuntime", () => {
  it("activates once, routes repeat activation through navigation, and cleans up once", () => {
    const activate = vi.fn();
    const navigate = vi.fn();
    const cleanup = vi.fn();
    const feature: EnhancementFeature = {
      activate,
      navigate,
      cleanup,
    };
    const runtime = new EnhancementRuntime([feature]);
    const context = { route: detectStuudiumRoute("https://torg.ope.ee/s/520") };

    runtime.activate(context);
    runtime.activate(context);
    runtime.cleanup();
    runtime.cleanup();

    expect(activate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(runtime.active).toBe(false);
  });
});
