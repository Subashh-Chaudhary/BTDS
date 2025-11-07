from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image
from fastapi.responses import FileResponse
import io, os, time
import shutil

app = FastAPI()

# Directories setup
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "static/predictions"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Load your trained model
MODEL_PATH = "./model/btds.pt"
print("🧠 Loading YOLO model...")
model = YOLO(MODEL_PATH)
print("✅ Model loaded successfully!")
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Input validation
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
            
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
            
        # Generate unique filename while preserving extension
        timestamp = str(int(time.time()))
        ext = os.path.splitext(file.filename)[1].lower()
        if not ext:
            ext = '.jpg'  # default extension
        filename = f"{timestamp}_scan{ext}"
        
        print(f"Processing file: {filename} ({file.content_type})")
        
        # Clean up any existing prediction files
        base_detect_dir = os.path.join("runs", "detect")
        try:
            if os.path.exists(base_detect_dir):
                print("Cleaning up previous detection outputs...")
                for d in os.listdir(base_detect_dir):
                    if d.startswith("predict"):
                        dir_path = os.path.join(base_detect_dir, d)
                        try:
                            if os.path.isdir(dir_path):
                                shutil.rmtree(dir_path)
                                print(f"Removed directory: {dir_path}")
                        except Exception as e:
                            print(f"Warning: Failed to remove directory {dir_path}: {e}")
        except Exception as e:
            print(f"Warning: Failed to clean output directories: {e}")
            
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Read and save upload
        try:
            image_bytes = await file.read()
            if not image_bytes:
                raise HTTPException(status_code=400, detail="Empty file received")
                
            upload_path = os.path.join(UPLOAD_DIR, filename)
            print(f"Saving upload to: {upload_path}")
            with open(upload_path, "wb") as f:
                f.write(image_bytes)
            
            if not os.path.exists(upload_path):
                raise HTTPException(status_code=500, detail="Failed to save uploaded file")
                
            print(f"File saved successfully, size: {len(image_bytes)} bytes")
        except Exception as e:
            print(f"Error saving uploaded file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")
        
        # Run YOLO detection and capture the output path
        print(f"Running YOLO detection on: {upload_path}")
        results = model.predict(source=upload_path, conf=0.25, save=True)
        
        # Get the save directory from results
        if not results or len(results) == 0:
            raise Exception("No detection results returned from YOLO")
            
        # Get the save directory from the first result
        save_dir = str(results[0].save_dir) if results and len(results) > 0 else None
        print(f"YOLO save directory: {save_dir}")
        
        if not save_dir or not os.path.exists(save_dir):
            raise Exception(f"YOLO output directory not found: {save_dir}")
            
        # List contents of save directory
        print(f"Contents of {save_dir}:")
        try:
            for f in os.listdir(save_dir):
                print(f"  - {f}")
        except Exception as e:
            print(f"Error listing save directory: {e}")
            
        # Find the output file
        result_files = [f for f in os.listdir(save_dir) 
                       if os.path.isfile(os.path.join(save_dir, f))]
                       
        if not result_files:
            raise Exception(f"No output files found in {save_dir}")
            
        # Get the result file (should be only one)
        result_file = result_files[0]
        yolo_result_path = os.path.join(save_dir, result_file)
        print(f"Found result file: {yolo_result_path}")
            
        # Use the save directory from YOLO results
        if not save_dir or not os.path.exists(save_dir):
            raise Exception(f"YOLO output directory not found or invalid: {save_dir}")
            
        print(f"Using output directory: {save_dir}")
        
        # Get the result file path
        result_files = [f for f in os.listdir(save_dir) 
                       if os.path.isfile(os.path.join(save_dir, f))]
        
        if not result_files:
            raise Exception(f"No output files found in {save_dir}")
        
        # Use the first result file
        yolo_result_path = os.path.join(save_dir, result_files[0])
        print(f"Using result file: {yolo_result_path}")
        
        if not os.path.exists(yolo_result_path):
            raise Exception(f"Result file not found at: {yolo_result_path}")
            
        print(f"Result file exists and is of size: {os.path.getsize(yolo_result_path)} bytes")
            
        # Prepare output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Use original filename for output
        output_filename = os.path.splitext(filename)[0] + os.path.splitext(yolo_result_path)[1]
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        print(f"Copying result to: {output_path}")
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Copy result file
        try:
            shutil.copy2(yolo_result_path, output_path)
            print(f"Successfully copied result to: {output_path}")
            
            # Verify the copy
            if not os.path.exists(output_path):
                raise Exception("Failed to create output file")
                
            print(f"Output file exists and is of size: {os.path.getsize(output_path)} bytes")
        except Exception as e:
            print(f"Error copying result: {e}")
            raise Exception(f"Failed to copy result file: {str(e)}")
            
        # Cleanup
        try:
            if os.path.exists(upload_path):
                os.remove(upload_path)
                print("Cleaned up upload file")
        except Exception as e:
            print(f"Warning: Failed to clean up upload file: {e}")
        
        # Keep the YOLO output for debugging
        print("Keeping YOLO output directory for debugging")
            
        # Extract detection data
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": [float(x) for x in box.xyxy[0].tolist()]
                })

        # Prepare response using the actual output filename (which might have a different extension)
        response = {
            "totalDetections": len(detections),
            "detections": detections,
            "outputImage": f"/static/predictions/{output_filename}"  # Use output_filename which has the correct extension
        }
        
        print(f"Processing completed. Image available at: {response['outputImage']}")
        return response
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
