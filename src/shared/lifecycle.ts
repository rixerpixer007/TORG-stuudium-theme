import type { StuudiumRoute } from "./routes";

export interface EnhancementContext {
  route: StuudiumRoute;
}

export interface EnhancementFeature {
  activate(context: EnhancementContext): void;
  cleanup(): void;
  navigate(context: EnhancementContext): void;
}

export class EnhancementRuntime {
  readonly #features: readonly EnhancementFeature[];
  #active = false;

  constructor(features: readonly EnhancementFeature[]) {
    this.#features = features;
  }

  activate(context: EnhancementContext): void {
    if (this.#active) {
      this.navigate(context);
      return;
    }

    this.#active = true;
    for (const feature of this.#features) {
      feature.activate(context);
    }
  }

  navigate(context: EnhancementContext): void {
    if (!this.#active) return;
    for (const feature of this.#features) {
      feature.navigate(context);
    }
  }

  cleanup(): void {
    if (!this.#active) return;
    this.#active = false;
    for (const feature of [...this.#features].reverse()) {
      feature.cleanup();
    }
  }

  get active(): boolean {
    return this.#active;
  }
}
