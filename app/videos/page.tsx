import VideoExporter from "@/components/VideoExporter";
import AutoVideoMaker from "@/components/AutoVideoMaker";
import SexualDysfunctionVideo from "@/components/SexualDysfunctionVideo";
import FractureVideo from "@/components/FractureVideo";
import PelvisVideo from "@/components/PelvisVideo";
import EyeVideos from "@/components/EyeVideos";

export default function VideosPage() {
  return (
    <main style={{ padding: "40px 16px", minHeight: "100vh", background: "#0B1F3A" }}>
      <AutoVideoMaker />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <FractureVideo />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <PelvisVideo />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <EyeVideos />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <SexualDysfunctionVideo />
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" }} />
      <VideoExporter />
    </main>
  );
}
