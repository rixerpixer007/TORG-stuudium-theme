import { describe, expect, it } from "vitest";

import { detectStuudiumRoute } from "../src/shared/routes";
import { isSupportedStuudiumUrl } from "../src/shared/sites";

describe("supported Stuudium scope", () => {
  it("accepts only the verified HTTPS TORG origin", () => {
    expect(isSupportedStuudiumUrl("https://torg.ope.ee/s/520")).toBe(true);
    expect(isSupportedStuudiumUrl("http://torg.ope.ee/s/520")).toBe(false);
    expect(isSupportedStuudiumUrl("https://another-school.ope.ee/")).toBe(false);
    expect(isSupportedStuudiumUrl("https://view.officeapps.live.com/")).toBe(false);
  });

  it("classifies representative supported routes", () => {
    expect(detectStuudiumRoute("https://torg.ope.ee/s/520").kind).toBe("dashboard");
    expect(detectStuudiumRoute("https://torg.ope.ee/tera/course").kind).toBe("tera");
    expect(detectStuudiumRoute("https://torg.ope.ee/suhtlus/").kind).toBe("suhtlus");
    expect(detectStuudiumRoute("https://torg.ope.ee/subjects/student/1").kind).toBe("subjects");
  });
});
