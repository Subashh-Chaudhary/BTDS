from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image
from uuid import uuid4
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
async def predict(file: UploadFile = File(...), request_id: str = Form(None)):
    try:
        # Input validation
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")

        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        # Generate unique filename while preserving extension.
        # Prefer provided request_id (from backend) to avoid collisions; fall back to uuid4.
        uid = request_id or str(uuid4())
        timestamp = str(int(time.time()))
        ext = os.path.splitext(file.filename)[1].lower()
        if not ext:
            ext = '.jpg'  # default extension
        filename = f"{timestamp}_{uid}_scan{ext}"

        print(f"Processing file: {filename} ({file.content_type})")

        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Read and save upload
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

        # Run YOLO detection and capture the output path. Use a unique name so outputs
        # are generated in a per-request folder (runs/detect/<name>/...). This avoids
        # races and file collisions when multiple requests are processed concurrently.
        unique_name = f"predict_{uid}_{timestamp}"
        print(f"Running YOLO detection on: {upload_path} with output name: {unique_name}")
        results = model.predict(source=upload_path, conf=0.25, save=True, project="runs/detect", name=unique_name, exist_ok=True)

        # Get the save directory from results
        if not results or len(results) == 0:
            raise Exception("No detection results returned from YOLO")

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

        # Find the output file(s)
        result_files = [f for f in os.listdir(save_dir) if os.path.isfile(os.path.join(save_dir, f))]

        if not result_files:
            raise Exception(f"No output files found in {save_dir}")

        # Prefer image files only
        image_exts = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
        image_files = [f for f in result_files if os.path.splitext(f)[1].lower() in image_exts]

        if not image_files:
            # fallback to any file
            image_files = result_files

        # Log candidate files with sizes for debugging
        candidate_info = []
        for f in image_files:
            p = os.path.join(save_dir, f)
            try:
                candidate_info.append({'file': f, 'size': os.path.getsize(p)})
            except Exception:
                candidate_info.append({'file': f, 'size': None})
        print(f"Candidate output files: {candidate_info}")

        # Try to match the file that contains the original upload base name
        upload_base = os.path.splitext(filename)[0]
        matched = [f for f in image_files if upload_base in f]
        if matched:
            # Prefer the matched file with largest size
            matched.sort(key=lambda fn: os.path.getsize(os.path.join(save_dir, fn)) if os.path.exists(os.path.join(save_dir, fn)) else 0, reverse=True)
            chosen = matched[0]
        else:
            # Otherwise choose the largest image file as it's most likely the annotated output
            image_files.sort(key=lambda fn: os.path.getsize(os.path.join(save_dir, fn)) if os.path.exists(os.path.join(save_dir, fn)) else 0, reverse=True)
            chosen = image_files[0]

        yolo_result_path = os.path.join(save_dir, chosen)
        print(f"Chosen result file: {yolo_result_path}")

        if not os.path.exists(yolo_result_path):
            raise Exception(f"Result file not found at: {yolo_result_path}")

        print(f"Result file exists and is of size: {os.path.getsize(yolo_result_path)} bytes")

        # Prepare output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Use original filename for output but include uid to ensure uniqueness
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
