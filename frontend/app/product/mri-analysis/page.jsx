export default function MRIAnalysisPage() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">MRI Analysis</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Learn how our system analyzes MRI scans to detect brain tumors with AI precision.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Advanced Scan Processing</h2>
          <p className="text-muted-foreground">
            Your MRI scans are processed using YOLOv8 and deep-learning segmentation models.
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Accurate Region Detection</h2>
          <p className="text-muted-foreground">
            Tumor regions are highlighted with bounding boxes and confidence scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
