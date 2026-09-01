from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import cv2
import io

app = FastAPI()

# ================================
# CORS - React Frontend Connection
# ================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================
# LOAD TRAINED MODEL
# ================================

model = tf.keras.models.load_model(
    "best_leaf_disease_model.keras"
)


# ================================
# CLASS NAMES
# ================================

class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]


# ================================
# TREATMENT & PREVENTION
# ================================

disease_info = {
    "Apple scab": {
        "treatment": "Remove and destroy infected leaves. Use a recommended fungicide.",
        "prevention": "Keep the area clean and avoid prolonged moisture on leaves."
    },

    "Black rot": {
        "treatment": "Remove infected fruits and leaves. Apply an appropriate fungicide.",
        "prevention": "Prune infected plant parts and maintain good air circulation."
    },

    "Cedar apple rust": {
        "treatment": "Remove heavily infected leaves and apply a suitable fungicide.",
        "prevention": "Avoid planting apple trees close to cedar or juniper hosts."
    },

    "Powdery mildew": {
        "treatment": "Remove affected leaves and use a recommended fungicide.",
        "prevention": "Provide good air circulation and avoid overcrowding."
    },

    "Bacterial spot": {
        "treatment": "Remove infected leaves and use a recommended copper-based treatment.",
        "prevention": "Avoid overhead watering and use disease-free seeds."
    },

    "Early blight": {
        "treatment": "Remove infected leaves and apply a suitable fungicide.",
        "prevention": "Practice crop rotation and avoid wet foliage."
    },

    "Late blight": {
        "treatment": "Remove severely infected plants and apply an appropriate fungicide.",
        "prevention": "Avoid excessive moisture and maintain good air circulation."
    },

    "Leaf Mold": {
        "treatment": "Remove affected leaves and improve ventilation.",
        "prevention": "Reduce humidity and avoid overcrowding."
    },

    "Septoria leaf spot": {
        "treatment": "Remove infected leaves and use an appropriate fungicide.",
        "prevention": "Avoid overhead watering and practice crop rotation."
    },

    "Spider mites Two-spotted spider mite": {
        "treatment": "Spray the plant with water and use a suitable miticide if necessary.",
        "prevention": "Maintain plant health and regularly inspect the underside of leaves."
    },

    "Target Spot": {
        "treatment": "Remove infected leaves and apply an appropriate fungicide.",
        "prevention": "Maintain proper spacing and avoid prolonged leaf wetness."
    },

    "Tomato Yellow Leaf Curl Virus": {
        "treatment": "Remove severely infected plants because there is no direct cure.",
        "prevention": "Control whiteflies and use resistant plant varieties."
    },

    "Tomato mosaic virus": {
        "treatment": "Remove infected plants because there is no direct cure.",
        "prevention": "Disinfect tools and avoid handling plants after touching infected plants."
    },

    "Leaf blight (Isariopsis Leaf Spot)": {
        "treatment": "Remove infected leaves and apply a suitable fungicide.",
        "prevention": "Maintain good air circulation and avoid excessive leaf moisture."
    },

    "Esca (Black Measles)": {
        "treatment": "Prune infected wood and remove severely infected plants.",
        "prevention": "Use clean pruning tools and avoid unnecessary trunk wounds."
    },

    "Haunglongbing (Citrus greening)": {
        "treatment": "There is no complete cure. Remove severely infected trees and manage insect vectors.",
        "prevention": "Control psyllid insects and use disease-free planting material."
    },

    "Cercospora leaf spot Gray leaf spot": {
        "treatment": "Apply a recommended fungicide and remove heavily infected leaves.",
        "prevention": "Practice crop rotation and avoid planting susceptible crops repeatedly."
    },

    "Common rust": {
        "treatment": "Use a suitable fungicide if infection is severe.",
        "prevention": "Plant resistant varieties and maintain good crop spacing."
    },

    "Northern Leaf Blight": {
        "treatment": "Apply a suitable fungicide and remove heavily infected leaves.",
        "prevention": "Use crop rotation and resistant varieties."
    },

    "Leaf scorch": {
        "treatment": "Remove severely damaged leaves and improve plant care.",
        "prevention": "Maintain proper watering and avoid plant stress."
    }
}


# ================================
# HELPER FUNCTION
# ================================

def clean_class_name(class_name):

    parts = class_name.split("___")

    plant = parts[0]
    disease = parts[1]

    plant = plant.replace("_", " ")
    disease = disease.replace("_", " ")

    return plant, disease


# ================================
# IMAGE QUALITY CHECK
# ================================

def check_image_quality(image):
    """
    Checks image resolution, brightness, and blur before prediction.
    """

    image_array = np.array(image)

    # Convert RGB image to grayscale
    gray = cv2.cvtColor(
        image_array,
        cv2.COLOR_RGB2GRAY
    )

    height, width = gray.shape

    # 1. Resolution check
    if width < 100 or height < 100:
        return {
            "valid": False,
            "message": "Image resolution is too low. Please upload a clearer image."
        }

    # 2. Brightness check
    brightness = float(np.mean(gray))

    if brightness < 40:
        return {
            "valid": False,
            "message": "Image is too dark. Please capture the leaf in better lighting."
        }

    if brightness > 220:
        return {
            "valid": False,
            "message": "Image is too bright. Please avoid strong direct light."
        }

    # 3. Blur check using Variance of Laplacian
    blur_score = float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()
    )

    if blur_score < 20:
        return {
            "valid": False,
            "message": "Image appears blurry. Please capture a sharper leaf image."
        }

    return {
        "valid": True,
        "brightness": round(brightness, 2),
        "blur_score": round(blur_score, 2)
    }


# ================================
# HOME API
# ================================

@app.get("/")
def home():

    return {
        "message": "Leaf Disease Detection API is running!"
    }


# ================================
# PREDICTION API
# ================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:

        # Read uploaded image
        image_bytes = await file.read()

        # Convert image to RGB
        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        # ================================
        # IMAGE QUALITY CHECK
        # ================================

        quality_result = check_image_quality(image)

        if not quality_result["valid"]:
            return {
                "valid_image": False,
                "plant": "Unknown",
                "disease": "Image Quality Warning",
                "confidence": 0,
                "top_predictions": [],
                "treatment": quality_result["message"],
                "prevention": (
                    "Use a clear, well-lit, sharp image of the leaf "
                    "for better disease detection."
                ),
                "status": "Image quality check failed",
                "is_unknown": True,
                "unknown": True,
                "message": quality_result["message"]
            }

        # Resize image after quality validation
        image = image.resize((128, 128))

        # Convert image to numpy array
        image_array = np.array(image)

        # Add batch dimension
        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # Model prediction
        predictions = model.predict(
            image_array,
            verbose=0
        )

        probabilities = predictions[0]

        # ================================
        # BEST PREDICTION
        # ================================

        predicted_index = int(
            np.argmax(probabilities)
        )

        confidence = float(
            probabilities[predicted_index]
        ) * 100

        predicted_class = class_names[
            predicted_index
        ]

        plant, disease = clean_class_name(
            predicted_class
        )


        # ================================
        # TOP 3 PREDICTIONS
        # ================================

        top_3_indices = probabilities.argsort()[
            -3:
        ][::-1]

        top_3_predictions = []

        for index in top_3_indices:

            top_class = class_names[int(index)]

            top_plant, top_disease = clean_class_name(
                top_class
            )

            top_3_predictions.append({
                "plant": top_plant,
                "disease": top_disease,
                "confidence": round(
                    float(probabilities[index]) * 100,
                    2
                )
            })


        # ================================
        # UNKNOWN LEAF CHECK
        # ================================

        if confidence < 60:

            return {
                "plant": "Unknown",
                "disease": "Unknown Leaf",
                "confidence": round(confidence, 2),
                "top_predictions": top_3_predictions,
                "treatment": (
                    "This image does not match any known "
                    "plant disease with sufficient confidence."
                ),
                "prevention": (
                    "Please upload a clear image of a supported "
                    "plant leaf."
                ),
                "valid_image": True,
                "status": "Unknown leaf detected",
                "is_unknown": True,
                "unknown": True
            }


        # ================================
        # DISEASE INFORMATION
        # ================================

        info = disease_info.get(
            disease,
            {
                "treatment": (
                    "No specific treatment information available. "
                    "Consult an agricultural expert."
                ),

                "prevention": (
                    "Maintain proper plant hygiene and regularly "
                    "monitor the plant."
                )
            }
        )


        # ================================
        # FINAL RESPONSE
        # ================================

        return {
            "plant": plant,
            "disease": disease,
            "confidence": round(confidence, 2),
            "top_predictions": top_3_predictions,
            "treatment": info["treatment"],
            "prevention": info["prevention"],
            "valid_image": True,
            "status": "Prediction completed successfully",
            "is_unknown": False,
            "unknown": False
        }


    except Exception as e:

        print("Prediction Error:", str(e))

        return {
            "plant": "Unknown",
            "disease": "Unknown",
            "confidence": 0,
            "top_predictions": [],
            "treatment": (
                "Unable to process the uploaded image."
            ),
            "prevention": (
                "Please upload a clear valid image."
            ),
            "valid_image": False,
            "status": "Prediction failed",
            "is_unknown": True,
            "unknown": True,
            "message": "Unable to process the uploaded image."
        }