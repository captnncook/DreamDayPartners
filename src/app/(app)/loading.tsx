import { SkeletonBlock } from "@/components/Skeleton";

// Directe skeleton bij navigatie binnen de app-schil: de sidebar blijft
// staan en het contentgebied reageert meteen, in plaats van te wachten
// tot de server de nieuwe pagina volledig gerenderd heeft.
export default function AppLoading() {
  return (
    <div className="px-4 py-6 md:p-8 max-w-3xl mx-auto space-y-4">
      <SkeletonBlock style={{ height: "2rem", width: "50%", marginBottom: "1.5rem" }} />
      <SkeletonBlock style={{ height: "140px", borderRadius: "16px" }} />
      <SkeletonBlock style={{ height: "56px", borderRadius: "12px" }} />
      <SkeletonBlock style={{ height: "56px", borderRadius: "12px" }} />
      <SkeletonBlock style={{ height: "56px", borderRadius: "12px" }} />
    </div>
  );
}
