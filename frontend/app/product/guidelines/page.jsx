export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold mb-5">Guidelines</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Recommended MRI scanning and uploading guidelines for best results.
      </p>

      <ul className="space-y-4 text-muted-foreground text-base">
        <li>• Upload clear MRI images without noise.</li>
        <li>• Use DICOM or PNG format for best quality.</li>
        <li>• Avoid cropped images.</li>
        <li>• Make sure the scan covers complete brain regions.</li>
      </ul>
    </div>
  );
}
