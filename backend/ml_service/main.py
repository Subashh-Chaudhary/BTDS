from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pickle
import numpy as np
import os
from typing import Dict, Any

app = FastAPI(
    title="Diabetes Prediction ML Service",
    description="Machine Learning service for diabetes prediction using Random Forest, Logistic Regression, and SVM models",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
MODELS_DIR = "./models"
MODEL_PATHS = {
    "random_forest": os.path.join(MODELS_DIR, "random_forest_model.sav"),
    "logistic_regression": os.path.join(MODELS_DIR, "logistic_regression_model.sav"),
    "svm": os.path.join(MODELS_DIR, "svm_model.sav")
}

# Global dictionary to store loaded models
models: Dict[str, Any] = {}


class DiabetesInput(BaseModel):
    """Input schema for diabetes prediction"""
    pregnancies: int = Field(..., ge=0, description="Number of pregnancies")
    glucose: int = Field(..., ge=0, description="Plasma glucose concentration")
    blood_pressure: int = Field(..., ge=0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: int = Field(..., ge=0, description="Triceps skin fold thickness (mm)")
    insulin: int = Field(..., ge=0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(..., ge=0, description="Body mass index (weight in kg/(height in m)^2)")
    diabetes_pedigree_function: float = Field(..., ge=0, description="Diabetes pedigree function")
    age: int = Field(..., ge=0, description="Age in years")

    class Config:
        schema_extra = {
            "example": {
                "pregnancies": 6,
                "glucose": 148,
                "blood_pressure": 72,
                "skin_thickness": 35,
                "insulin": 0,
                "bmi": 33.6,
                "diabetes_pedigree_function": 0.627,
                "age": 50
            }
        }


class ModelPrediction(BaseModel):
    """Prediction result from a single model"""
    prediction: int = Field(..., description="Predicted class (0: No diabetes, 1: Diabetes)")
    probability: float = Field(..., description="Probability of positive class (diabetes)")


class PredictionResponse(BaseModel):
    """Complete prediction response with all models"""
    predictions: Dict[str, ModelPrediction]
    ensemble_prediction: int = Field(..., description="Majority vote from all models")
    confidence: float = Field(..., description="Average probability across all models")


def load_models():
    """Load all scikit-learn models from .sav files"""
    print("🧠 Loading ML models...")
    
    for model_name, model_path in MODEL_PATHS.items():
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        try:
            with open(model_path, 'rb') as f:
                models[model_name] = pickle.load(f)
            print(f"✅ Loaded {model_name} model successfully")
        except Exception as e:
            raise RuntimeError(f"Failed to load {model_name} model: {str(e)}")
    
    print(f"✅ All {len(models)} models loaded successfully!")


@app.on_event("startup")
async def startup_event():
    """Load models when the application starts"""
    load_models()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Diabetes Prediction ML Service",
        "models_loaded": list(models.keys()),
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            model_name: "loaded" for model_name in models.keys()
        }
    }


@app.post("/diabetes/predict", response_model=PredictionResponse)
async def predict_diabetes(input_data: DiabetesInput):
    """
    Predict diabetes using all three models (Random Forest, Logistic Regression, SVM)
    
    Returns predictions from all models along with an ensemble prediction
    """
    try:
        # Prepare input features as numpy array
        features = np.array([[
            input_data.pregnancies,
            input_data.glucose,
            input_data.blood_pressure,
            input_data.skin_thickness,
            input_data.insulin,
            input_data.bmi,
            input_data.diabetes_pedigree_function,
            input_data.age
        ]])
        
        # Get predictions from all models
        predictions_dict = {}
        all_predictions = []
        all_probabilities = []
        
        for model_name, model in models.items():
            # Get prediction
            prediction = int(model.predict(features)[0])
            
            # Get probability (handle models that may not have predict_proba)
            try:
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba(features)[0]
                    # Probability of positive class (diabetes)
                    probability = float(proba[1])
                elif hasattr(model, 'decision_function'):
                    # For SVM, use decision function and convert to probability-like score
                    decision = model.decision_function(features)[0]
                    # Convert to probability using sigmoid-like transformation
                    probability = float(1 / (1 + np.exp(-decision)))
                else:
                    # Fallback: use prediction as probability
                    probability = float(prediction)
            except Exception as e:
                print(f"Warning: Could not get probability for {model_name}: {e}")
                probability = float(prediction)
            
            predictions_dict[model_name] = ModelPrediction(
                prediction=prediction,
                probability=probability
            )
            
            all_predictions.append(prediction)
            all_probabilities.append(probability)
        
        # Calculate ensemble prediction (majority vote)
        ensemble_prediction = int(np.round(np.mean(all_predictions)))
        
        # Calculate average confidence
        average_confidence = float(np.mean(all_probabilities))
        
        return PredictionResponse(
            predictions=predictions_dict,
            ensemble_prediction=ensemble_prediction,
            confidence=average_confidence
        )
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict")
async def predict_alias(input_data: DiabetesInput):
    """
    Alias endpoint for /diabetes/predict for backward compatibility
    """
    return await predict_diabetes(input_data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
