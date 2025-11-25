import jsPDF from "jspdf";

interface PredictionData {
  prediction: {
    id?: string;
    user_id: string;
    pregnancies: number;
    glucose: number;
    blood_pressure: number;
    skin_thickness: number;
    insulin: number;
    bmi: number;
    diabetes_pedigree_function: number;
    age: number;
    created_at: string;
  };
  results: Array<{
    model_name: string;
    prediction_value: number;
    probability: number;
  }>;
  ml_response: {
    ensemble_prediction: number;
    confidence: number;
    models: {
      [key: string]: {
        prediction: number;
        probability: number;
      };
    };
  };
}

interface UserInfo {
  name?: string;
  email?: string;
}

const getRiskCategory = (probability: number): { category: string; color: [number, number, number] } => {
  const p = probability * 100;
  if (p < 1) return { category: "Very Low Risk", color: [34, 197, 94] }; // green
  if (p < 5) return { category: "Low Risk", color: [132, 204, 22] }; // lime
  if (p < 20) return { category: "Moderate Risk", color: [234, 179, 8] }; // yellow
  if (p < 50) return { category: "Elevated Risk", color: [249, 115, 22] }; // orange
  return { category: "High Risk", color: [239, 68, 68] }; // red
};

const getRiskAdvice = (probability: number): string => {
  const p = probability * 100;
  if (p < 1) return "No immediate concern. Continue routine monitoring and maintain healthy lifestyle.";
  if (p < 5) return "Low risk detected. Consider lifestyle advice and routine follow-up with your healthcare provider.";
  if (p < 20) return "Moderate risk identified. Further clinical assessment is recommended.";
  if (p < 50) return "Elevated risk detected. Clinical follow-up and diagnostic testing are recommended.";
  return "High risk identified. Urgent clinical evaluation is strongly recommended.";
};

export const generateMedicalReport = (data: PredictionData, userInfo?: UserInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header - Medical Report Title
  doc.setFillColor(37, 99, 235); // Blue header
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DIABETES RISK ASSESSMENT REPORT", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Prediction Analysis", pageWidth / 2, 25, { align: "center" });

  yPos = 45;

  // Report Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const reportDate = new Date(data.prediction.created_at).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  doc.text(`Report Date: ${reportDate}`, 15, yPos);
  yPos += 6;
  doc.text(`Report ID: ${data.prediction.id?.substring(0, 18) || "N/A"}`, 15, yPos);
  yPos += 6;
  
  if (userInfo?.name) {
    doc.text(`Patient Name: ${userInfo.name}`, 15, yPos);
    yPos += 6;
  }
  if (userInfo?.email) {
    doc.text(`Contact: ${userInfo.email}`, 15, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  // OVERALL ASSESSMENT SECTION
  doc.setFillColor(248, 250, 252);
  doc.rect(15, yPos, pageWidth - 30, 45, "F");
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("OVERALL ASSESSMENT", 20, yPos);
  
  yPos += 10;
  const ensembleConfidence = data.ml_response.confidence;
  const ensemblePrediction = data.ml_response.ensemble_prediction;
  const riskInfo = getRiskCategory(ensembleConfidence);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Ensemble Prediction: ${ensemblePrediction === 1 ? "Positive (Diabetes Risk Detected)" : "Negative (No Diabetes Risk)"}`, 20, yPos);
  
  yPos += 8;
  doc.text(`Confidence Level: ${(ensembleConfidence * 100).toFixed(2)}%`, 20, yPos);
  
  yPos += 8;
  doc.setTextColor(...riskInfo.color);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Category: ${riskInfo.category}`, 20, yPos);

  yPos += 15;

  // CLINICAL RECOMMENDATION
  doc.setFillColor(254, 249, 195);
  doc.rect(15, yPos, pageWidth - 30, 25, "F");
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(161, 98, 7);
  doc.text("CLINICAL RECOMMENDATION", 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const advice = getRiskAdvice(ensembleConfidence);
  const adviceLines = doc.splitTextToSize(advice, pageWidth - 50);
  doc.text(adviceLines, 20, yPos);
  
  yPos += adviceLines.length * 5 + 10;

  // PATIENT DATA SECTION
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("PATIENT DATA", 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  const patientData = [
    ["Age", `${data.prediction.age} years`],
    ["Number of Pregnancies", `${data.prediction.pregnancies}`],
    ["Glucose Level", `${data.prediction.glucose} mg/dL`],
    ["Blood Pressure", `${data.prediction.blood_pressure} mm Hg`],
    ["Skin Thickness", `${data.prediction.skin_thickness} mm`],
    ["Insulin Level", `${data.prediction.insulin} μU/mL`],
    ["BMI", `${data.prediction.bmi.toFixed(1)} kg/m²`],
    ["Diabetes Pedigree Function", `${data.prediction.diabetes_pedigree_function.toFixed(3)}`],
  ];

  // Create table
  const startX = 15;
  const colWidth = (pageWidth - 30) / 2;
  
  doc.setFillColor(37, 99, 235);
  doc.rect(startX, yPos, colWidth, 8, "F");
  doc.rect(startX + colWidth, yPos, colWidth, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Parameter", startX + 3, yPos + 5);
  doc.text("Value", startX + colWidth + 3, yPos + 5);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  patientData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, yPos, pageWidth - 30, 7, "F");
    }
    doc.text(row[0], startX + 3, yPos + 5);
    doc.text(row[1], startX + colWidth + 3, yPos + 5);
    yPos += 7;
  });

  yPos += 8;

  // MODEL ANALYSIS SECTION
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("INDIVIDUAL MODEL ANALYSIS", 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Model results table
  doc.setFillColor(37, 99, 235);
  doc.rect(startX, yPos, (pageWidth - 30) / 3, 8, "F");
  doc.rect(startX + (pageWidth - 30) / 3, yPos, (pageWidth - 30) / 3, 8, "F");
  doc.rect(startX + (2 * (pageWidth - 30)) / 3, yPos, (pageWidth - 30) / 3, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Model", startX + 3, yPos + 5);
  doc.text("Probability", startX + (pageWidth - 30) / 3 + 3, yPos + 5);
  doc.text("Risk Level", startX + (2 * (pageWidth - 30)) / 3 + 3, yPos + 5);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  data.results.forEach((result, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, yPos, pageWidth - 30, 7, "F");
    }
    
    const modelName = result.model_name.replace(/_/g, " ").toUpperCase();
    const probability = (result.probability * 100).toFixed(2) + "%";
    const risk = getRiskCategory(result.probability);
    
    doc.text(modelName, startX + 3, yPos + 5);
    doc.text(probability, startX + (pageWidth - 30) / 3 + 3, yPos + 5);
    
    doc.setTextColor(...risk.color);
    doc.setFont("helvetica", "bold");
    doc.text(risk.category, startX + (2 * (pageWidth - 30)) / 3 + 3, yPos + 5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    yPos += 7;
  });

  yPos += 10;

  // DISCLAIMER SECTION
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(254, 226, 226);
  doc.rect(15, yPos, pageWidth - 30, 35, "F");
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28);
  doc.text("IMPORTANT DISCLAIMER", 20, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const disclaimer = "This report is generated by machine learning models and is intended for informational purposes only. It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical condition or treatment decisions. The predictions are based on statistical models and may not reflect individual circumstances.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 50);
  doc.text(disclaimerLines, 20, yPos);

  yPos = pageHeight - 15;

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Generated by Diabetes Risk Assessment System", pageWidth / 2, yPos, { align: "center" });
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - 20, yPos, { align: "right" });

  // Save the PDF
  const fileName = `Diabetes_Risk_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
