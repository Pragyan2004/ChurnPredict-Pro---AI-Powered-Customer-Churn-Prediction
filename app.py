from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

model = joblib.load('models/churn_model.pkl')
scaler = joblib.load('models/scaler.pkl')
feature_names = joblib.load('models/feature_names.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/insights')
def insights():
    return render_template('insights.html')

@app.route('/retention')
def retention():
    return render_template('retention.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        input_data = {
            'tenure': float(data['tenure']),
            'MonthlyCharges': float(data['monthly_charges']),
            'TotalCharges': float(data['total_charges']),
            'gender_Male': 1 if data['gender'] == 'Male' else 0,
            'SeniorCitizen': 1 if data['senior_citizen'] == 'Yes' else 0,
            'Partner_Yes': 1 if data['partner'] == 'Yes' else 0,
            'Dependents_Yes': 1 if data['dependents'] == 'Yes' else 0,
            'PhoneService_Yes': 1 if data['phone_service'] == 'Yes' else 0,
            'MultipleLines_No phone service': 1 if data['multiple_lines'] == 'No' else 0,
            'MultipleLines_Yes': 1 if data['multiple_lines'] == 'Yes' else 0,
            'InternetService_Fiber optic': 1 if data['internet_service'] == 'Fiber optic' else 0,
            'InternetService_No': 1 if data['internet_service'] == 'No' else 0,
            'OnlineSecurity_No internet service': 1 if data['online_security'] == 'No' else 0,
            'OnlineSecurity_Yes': 1 if data['online_security'] == 'Yes' else 0,
            'OnlineBackup_No internet service': 1 if data['online_backup'] == 'No' else 0,
            'OnlineBackup_Yes': 1 if data['online_backup'] == 'Yes' else 0,
            'DeviceProtection_No internet service': 1 if data['device_protection'] == 'No' else 0,
            'DeviceProtection_Yes': 1 if data['device_protection'] == 'Yes' else 0,
            'TechSupport_No internet service': 1 if data['tech_support'] == 'No' else 0,
            'TechSupport_Yes': 1 if data['tech_support'] == 'Yes' else 0,
            'StreamingTV_No internet service': 1 if data['streaming_tv'] == 'No' else 0,
            'StreamingTV_Yes': 1 if data['streaming_tv'] == 'Yes' else 0,
            'StreamingMovies_No internet service': 1 if data['streaming_movies'] == 'No' else 0,
            'StreamingMovies_Yes': 1 if data['streaming_movies'] == 'Yes' else 0,
            'Contract_One year': 1 if data['contract'] == 'One year' else 0,
            'Contract_Two year': 1 if data['contract'] == 'Two year' else 0,
            'PaperlessBilling_Yes': 1 if data['paperless_billing'] == 'Yes' else 0,
            'PaymentMethod_Credit card (automatic)': 1 if data['payment_method'] == 'Credit card' else 0,
            'PaymentMethod_Electronic check': 1 if data['payment_method'] == 'Electronic check' else 0,
            'PaymentMethod_Mailed check': 1 if data['payment_method'] == 'Mailed check' else 0
        }
        
        input_df = pd.DataFrame([input_data])
        
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[feature_names]
        
        input_scaled = scaler.transform(input_df)
        
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]
        
        retention_tips = generate_retention_tips(data, probability)
        
        return jsonify({
            'churn_prediction': 'Yes' if prediction == 1 else 'No',
            'churn_probability': round(probability * 100, 2),
            'risk_level': 'High' if probability > 0.7 else 'Medium' if probability > 0.4 else 'Low',
            'retention_tips': retention_tips
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def generate_retention_tips(data, probability):
    tips = []
    
    if data['contract'] == 'Month-to-month':
        tips.append("Offer long-term contract incentives")
    
    if data['internet_service'] == 'Fiber optic' and float(data['monthly_charges']) > 80:
        tips.append("Consider fiber optic service bundle discounts")
    
    if data['payment_method'] == 'Electronic check':
        tips.append("Promote automatic payment methods for discounts")
    
    if float(data['tenure']) < 12:
        tips.append("Provide loyalty rewards for long-term customers")
    
    if data['online_security'] == 'No':
        tips.append("Offer complimentary security service trial")
    
    return tips

if __name__ == '__main__':
    app.run(debug=True)