from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/ping")
def ping():
    return jsonify({
        "Response": "Pong!"
    })

@app.route('/submit-claim', methods=['POST'])
def submit_claim():
    claim_type = request.form.get('claimType')
    description = request.form.get('description')
    files = request.files.getlist('files')

    saved_files = []

    for file in files:
        if file:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            saved_files.append(file.filename)
    
    # TODO: Use a model to process the file and return the response!
    # model.predict(file);

    return jsonify({
        "status": "success",
        "message": "Claim submitted successfully",
        "data": {
            "claimType": claim_type,
            "description": description,
            "files": saved_files
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
