from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import torch
from PIL import Image
import imageio
import numpy as np
from io import BytesIO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

def process_frame(frame):
    frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
    results = model(frame_cv)
    for *xyxy, conf, cls in results.xyxy[0]:
        label = model.names[int(cls)]
        if label == 'car':
            x1, y1, x2, y2 = map(int, xyxy)
            confidence = float(conf)
            cv2.rectangle(frame_cv, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame_cv, f'{label} {confidence:.2f}', (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    return Image.fromarray(cv2.cvtColor(frame_cv, cv2.COLOR_BGR2RGB))

@app.post("/process-gif/")
async def process_gif(file: UploadFile = File(...)):
    contents = await file.read()
    gif = imageio.mimread(BytesIO(contents))
    
    processed_frames = [process_frame(frame) for frame in gif]

    output = BytesIO()
    imageio.mimsave(output, processed_frames, format='GIF', duration=0.1)
    output.seek(0)

    return StreamingResponse(output, media_type="image/gif")

