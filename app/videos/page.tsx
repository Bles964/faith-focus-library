import VideoExporter from "@/components/VideoExporter";
import ScriptGenerator from "@/components/ScriptGenerator";
import SexualDysfunctionVideo from "@/components/SexualDysfunctionVideo";

export default function VideosPage() {
  return (
    <main style={{ padding: "40px 16px", minHeight: "100vh", background: "#0B1F3A" }}>
      <ScriptGenerator />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <SexualDysfunctionVideo />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <VideoExporter />
    </main>
  );
}
