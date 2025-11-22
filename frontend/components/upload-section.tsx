"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/hooks/use-toast";
import { httpClient } from "@/lib/http-client";

export default function UploadSection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  // form fields
  const [pregnancies, setPregnancies] = useState<number | "">("");
  const [glucose, setGlucose] = useState<number | "">("");
  const [bloodPressure, setBloodPressure] = useState<number | "">("");
  const [skinThickness, setSkinThickness] = useState<number | "">("");
  const [insulin, setInsulin] = useState<number | "">("");
  const [bmi, setBmi] = useState<number | "">("");
  const [dpf, setDpf] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const { toast } = useToast();

  // Hide prediction section for expert users and admins per requirements
  // `user_type` isn't on the typed AuthResponse, but normalizeUser adds it.
  // Fallback to role so we don't rely on widened types here.
  const isExpert =
    (user as any)?.user_type === "expert" || user?.role === "expert";
  const isAdmin = !!user?.is_admin;
  if (isExpert || isAdmin) {
    return null; // Experts and admins should not see the upload UI
  }

  const showAuthToast = () => {
    toast({
      title: "Authentication Required",
      description: "Please login first to upload and analyze scans.",
      duration: 3000,
    });
  };
  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      showAuthToast();
      return;
    }

    if (!initialized) {
      toast({
        title: "Authenticating",
        description: "Checking session, please wait...",
        duration: 3000,
      });
      try {
        await initializeAuth();
      } catch (e) {
        console.warn("initializeAuth() failed during prediction flow", e);
      }
    }

    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !currentUser.id) {
      toast({
        title: "Prediction failed",
        description: "Could not determine logged in user. Please login again.",
        duration: 4000,
      });
      return;
    }

    // Basic validation
    const fields = {
      pregnancies,
      glucose,
      bloodPressure,
      skinThickness,
      insulin,
      bmi,
      dpf,
      age,
    };
    for (const [k, v] of Object.entries(fields)) {
      if (
        v === "" ||
        v === null ||
        v === undefined ||
        Number.isNaN(Number(v))
      ) {
        toast({
          title: "Missing data",
          description: `Please provide a valid value for ${k}.`,
          duration: 3000,
        });
        return;
      }
    }

    setIsAnalyzing(true);
    setResult(null);
    try {
      const payload = {
        user_id: currentUser.id,
        pregnancies: Number(pregnancies),
        glucose: Number(glucose),
        blood_pressure: Number(bloodPressure),
        skin_thickness: Number(skinThickness),
        insulin: Number(insulin),
        bmi: Number(bmi),
        diabetes_pedigree_function: Number(dpf),
        age: Number(age),
      };

      const res = await httpClient.post("/diabetes/predict", payload);
      const body = res?.data;
      const payloadData = body?.data ?? body;

      const successFlag =
        body?.success ?? (res?.status >= 200 && res?.status < 300);
      if (!successFlag) {
        toast({
          title: "Prediction failed",
          description: body?.message || "Prediction API failed",
          duration: 5000,
        });
        return;
      }

      setResult(payloadData);
      toast({
        title: "Prediction complete",
        description: body?.message || "Diabetes prediction returned",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Prediction error", err);
      const serverMessage = err?.response?.data?.message || err?.message;
      toast({
        title: "Prediction failed",
        description: serverMessage || "An unexpected error occurred",
        duration: 7000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="upload" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Diabetes Risk Checker
          </h2>
          <p className="text-lg text-muted-foreground">
            Enter clinical values to get a diabetes risk prediction
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Diabetes Prediction Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Number of pregnancies
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={pregnancies}
                onChange={(e) =>
                  setPregnancies(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Glucose level
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={glucose}
                onChange={(e) =>
                  setGlucose(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Blood pressure
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={bloodPressure}
                onChange={(e) =>
                  setBloodPressure(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Skin thickness
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={skinThickness}
                onChange={(e) =>
                  setSkinThickness(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Insulin level
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={insulin}
                onChange={(e) =>
                  setInsulin(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                BMI
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={bmi}
                onChange={(e) =>
                  setBmi(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Diabetes Pedigree Function
              </label>
              <input
                type="number"
                min={0}
                step={0.001}
                value={dpf}
                onChange={(e) =>
                  setDpf(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Age
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={age}
                onChange={(e) =>
                  setAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={isAnalyzing}
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Provide the values above and press Predict to get a diabetes
                risk estimate.
              </p>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>Predict Diabetes</>
                )}
              </button>
            </div>
          </form>

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-white/5 border border-border"
            >
              <h4 className="font-medium text-foreground mb-2">
                Prediction Result
              </h4>
              <div className="text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">
                    Prediction:{" "}
                  </span>
                  {result?.prediction?.label ??
                    result?.label ??
                    (result?.predicted ? String(result.predicted) : "N/A")}
                </p>
                {(result?.prediction?.probability ??
                  result?.probability ??
                  result?.confidence) != null && (
                  <p>
                    <span className="font-semibold text-foreground">
                      Probability:{" "}
                    </span>
                    {(
                      (result?.prediction?.probability ??
                        result?.probability ??
                        result?.confidence) * 100
                    ).toFixed(2)}
                    %
                  </p>
                )}
                {result?.details && <p className="mt-2">{result.details}</p>}
              </div>
            </motion.div>
          )}
          {/* Info Box */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 flex gap-3">
            <AlertCircle className="text-accent shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important:</p>
              <p>
                This tool is designed to assist medical professionals. Always
                consult with qualified healthcare providers for diagnosis and
                treatment decisions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
