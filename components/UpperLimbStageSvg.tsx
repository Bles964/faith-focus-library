import { buildSvg } from "./ulSvg";
import type { ULStage } from "./ulSvg";

export type { ULStage };

// Draws one scene of the upper-limb videos (the drawing itself lives in ulSvg.ts)
export default function UpperLimbStageSvg({ stage }: { stage: ULStage }) {
  return <div dangerouslySetInnerHTML={{ __html: buildSvg(stage) }} />;
}
