export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">Help Center</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Get answers, guidance, and support for using BrainDetect.
      </p>

      <div className="space-y-4">
        <p>• How to upload MRI images</p>
        <p>• Troubleshooting model errors</p>
        <p>• Understanding detection results</p>
      </div>
    </div>
  );
}
