"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import UpperLimbStageSvg from "./UpperLimbStageSvg";
import { VIDEOS } from "./ulData";

// All scenes of all sessions, in order, as one video
const ALL_STAGES = VIDEOS.flatMap((v) => v.stages);
// Where each scene's own-voice recording lives (so recordings made for a session video are reused)
const OWN_KEYS = VIDEOS.flatMap((v) => v.stages.map((_, i) => ({ f: v.fileName, i })));

export default function UpperLimbVideos() {
  return (
    <div style={{ maxWidth: 480, margin: "40px auto 0", paddingTop: 32, borderTop: "1px solid #2A3E5C" }}>
      <p style={{ color: "#F4F1EA", fontSize: "1.05rem", fontWeight: 600, marginBottom: 4 }}>
        Fractures and dislocations of the upper limb
      </p>
      <div style={{ color: "#9AA6B8", fontSize: ".8rem", marginBottom: 14 }}>
        One complete video from the introduction to the final revision ({ALL_STAGES.length} scenes). It is long, so keep this
        page open and the screen on while it builds. Finished scenes are remembered, so a retry is quicker.
      </div>

      {/* The heading below becomes the video's title in the library */}
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>
        Upper limb: complete course
      </p>
      <AutoVideoExporter
        stages={ALL_STAGES}
        StageComponent={UpperLimbStageSvg}
        buttonLabel="Make the complete upper limb video"
        fileName="upper-limb-complete.mp4"
        ownKeys={OWN_KEYS}
        hideVoice
      />

      <details style={{ marginTop: 36 }}>
        <summary style={{ color: "#9AA6B8", fontSize: ".85rem", cursor: "pointer" }}>
          Build session by session instead (optional)
        </summary>
        {VIDEOS.map((v) => (
          <div key={v.fileName} style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #2A3E5C" }}>
            <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>{v.title}</p>
            <AutoVideoExporter
              stages={v.stages}
              StageComponent={UpperLimbStageSvg}
              buttonLabel={v.button}
              fileName={v.fileName}
            />
          </div>
        ))}
      </details>
    </div>
  );
}
