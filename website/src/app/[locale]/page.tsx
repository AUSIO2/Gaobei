import FrontSlide from "@/components/sections/FrontSlide";
import TechHighlights from "@/components/sections/TechHighlights";
import SolutionsPreview from "@/components/sections/SolutionsPreview";
import StatsCounter from "@/components/sections/StatsCounter";
import OverviewSection from "@/components/sections/OverviewSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <FrontSlide />
      <TechHighlights />
      <SolutionsPreview />
      <StatsCounter />
      <OverviewSection />
      <CTASection />
    </main>
  );
}
