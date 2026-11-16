"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import UpperLimbStageSvg from "./UpperLimbStageSvg";
import { VIDEOS } from "./ulData";

// One video per session. The heading above each button becomes the video's title in the library.
export default function UpperLimbVideos() {
  return (
    <div style={{ maxWidth: 480, margin: "40px auto 0", paddingTop: 32, borderTop: "1px solid #2A3E5C" }}>
      <p style={{ color: "#F4F1EA", fontSize: "1.05rem", fontWeight: 600, marginBottom: 4 }}>
        Fractures and dislocations of the upper limb
      </p>
      <div style={{ color: "#9AA6B8", fontSize: ".8rem", marginBottom: 8 }}>
        Eleven short videos, one for each session. Record your own voice for any session, or let the computer voice read it.
      </div>
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
    </div>
  );
}
