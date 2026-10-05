import VideoExporter from "@/components/VideoExporter";
import AutoVideoMaker from "@/components/AutoVideoMaker";
import SexualDysfunctionVideo from "@/components/SexualDysfunctionVideo";
import FractureVideo from "@/components/FractureVideo";
import PelvisVideo from "@/components/PelvisVideo";
import EyeVideos from "@/components/EyeVideos";
import GenExamVideos from "@/components/GenExamVideos";

const rule = { margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" } as const;

export default function VideosPage() {
  return (
    <main style={{ padding: "40px 16px", minHeight: "100vh", background: "#0B1F3A" }}>
      <AutoVideoMaker />
      <hr style={rule} />
      <FractureVideo />
      <hr style={rule} />
      <PelvisVideo />
      <hr style={rule} />
      <EyeVideos />
      <hr style={rule} />
      <GenExamVideos />
      <hr style={rule} />
      <SexualDysfunctionVideo />
      <hr style={rule} />
      <VideoExporter />
    </main>
  );
}
