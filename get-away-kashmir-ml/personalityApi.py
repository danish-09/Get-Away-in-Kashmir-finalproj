# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model and mapping
model = joblib.load('personality_model.joblib')
personality_map = joblib.load('personality_map.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data
        data = request.json
        
        # Validate input
        if not data or 'answers' not in data:
            return jsonify({"error": "Missing 'answers' in request"}), 400
        
        answers = data['answers']
        
        if len(answers) != 60:
            return jsonify({"error": "Exactly 60 answers required"}), 400

        # Convert to 2D array and predict
        input_data = np.array(answers).reshape(1, -1)
        prediction_code = model.predict(input_data)[0]
        personality = personality_map[prediction_code]

        return jsonify({"personality": personality})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)