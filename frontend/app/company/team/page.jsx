export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-8">Our Team</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="text-center p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-xl font-semibold">Dr. Emma Watson</h2>
          <p className="text-muted-foreground text-sm">Head of Medical AI</p>
        </div>

        <div className="text-center p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-xl font-semibold">Dr. John Paul</h2>
          <p className="text-muted-foreground text-sm">MRI Specialist</p>
        </div>

        <div className="text-center p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-xl font-semibold">Alex Carter</h2>
          <p className="text-muted-foreground text-sm">Lead Engineer</p>
        </div>
      </div>
    </div>
  );
}
