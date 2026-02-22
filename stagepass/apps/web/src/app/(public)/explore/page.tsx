import ContentCard from "@/components/stagepass/ContentCard";
import Button from "@/components/ui/Button";

export default function ExplorePage() {
  const categories = ["Music", "DJ Sets", "Film", "Business", "Gaming"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explore</h1>
      
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        <Button variant="primary" className="rounded-full">All</Button>
        {categories.map(cat => (
          <Button key={cat} variant="secondary" className="rounded-full whitespace-nowrap">
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ContentCard
            key={i}
            id={`explore-${i}`}
            title={`Trending Content #${i}`}
            type="VIDEO"
            creator={{ slug: "creator", name: "Creator Name" }}
          />
        ))}
      </div>
    </div>
  );
}