export default function PublicationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">Publications</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Research papers and studies contributed by our AI research team.
      </p>

      <ul className="space-y-6">
        <li className="p-5 border rounded-xl bg-card shadow-sm">
          <h2 className="font-semibold">Deep Learning for Tumor Detection</h2>
          <p className="text-muted-foreground text-sm">Published in Medical AI Journal</p>
        </li>

        <li className="p-5 border rounded-xl bg-card shadow-sm">
          <h2 className="font-semibold">Image Classification in MRI</h2>
          <p className="text-muted-foreground text-sm">Published in IJCI Journal</p>
        </li>
      </ul>
    </div>
  );
}
