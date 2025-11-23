export default function OurWorkPage() {
  const projects = [
    {
      title: "Brain Tumor Detection System",
      description: "Real-time detection and classification of brain tumors using YOLOv8 with 94% accuracy across multiple MRI modalities.",
      status: "Clinical Validation",
      metrics: ["94% Accuracy", "Real-time Processing", "Multi-modal MRI"],
      icon: "🧠",
      category: "Diagnostics"
    },
    {
      title: "Medical Imaging Enhancement",
      description: "Deep learning models that enhance low-resolution medical images while preserving diagnostic quality.",
      status: "Research Phase",
      metrics: ["3x Resolution", "Noise Reduction", "DICOM Compatible"],
      icon: "🔍",
      category: "Image Processing"
    },
    {
      title: "Radiology Assistant AI",
      description: "AI-powered tool that helps radiologists prioritize critical cases and reduce diagnostic time by 40%.",
      status: "Pilot Deployment",
      metrics: ["40% Faster", "99.2% Recall", "Clinical Integration"],
      icon: "📊",
      category: "Workflow"
    },
    {
      title: "Pathology Analysis Suite",
      description: "Comprehensive digital pathology solution for automated tissue analysis and cancer detection.",
      status: "Production",
      metrics: ["Multi-tissue", "Batch Processing", "QC Integrated"],
      icon: "🔬",
      category: "Pathology"
    }
  ];

  const stats = [
    { number: "50K+", label: "Medical Images Processed" },
    { number: "12", label: "Research Publications" },
    { number: "8", label: "Clinical Partners" },
    { number: "3", label: "FDA Clearances" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🏥</span> Medical AI Innovations
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Advancing Healthcare Through AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We develop clinically validated AI solutions that enhance diagnostic accuracy, 
            streamline workflows, and improve patient outcomes across multiple medical specialties.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{project.icon}</div>
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  project.status === "Production" ? "bg-green-100 text-green-800" :
                  project.status === "Pilot Deployment" ? "bg-yellow-100 text-yellow-800" :
                  project.status === "Clinical Validation" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.metrics.map((metric, metricIndex) => (
                  <span 
                    key={metricIndex}
                    className="bg-gray-50 text-gray-700 text-sm px-3 py-1 rounded-lg border"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Interested in Collaborating?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join us in developing the next generation of medical AI solutions. 
            We partner with healthcare institutions and research organizations worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View Case Studies
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contact Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}