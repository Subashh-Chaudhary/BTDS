export default function ModelAccuracyPage() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">Model Accuracy</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Performance metrics of our AI model trained on brain tumor MRI datasets.
      </p>

      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <ul className="space-y-3 text-muted-foreground">
          <li>✔️ Accuracy: <strong>98.7%</strong></li>
          <li>✔️ Precision: <strong>97.4%</strong></li>
          <li>✔️ Recall: <strong>96.8%</strong></li>
          <li>✔️ F1 Score: <strong>97.1%</strong></li>
        </ul>
      </div>
    </div>
  );
}
