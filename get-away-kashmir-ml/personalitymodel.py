# train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv('16P.csv', encoding='latin1')

# Preprocessing
df = df.drop(columns=['Response Id'])
df['Personality'] = df['Personality'].astype('category')
personality_map = dict(enumerate(df['Personality'].cat.categories))
df['Personality_code'] = df['Personality'].cat.codes

# Prepare data
X = df.drop(columns=['Personality', 'Personality_code'])
y = df['Personality_code']

# Train model
model = RandomForestClassifier(n_estimators=200, 
                               max_depth=15,
                               min_samples_split=5,
                               class_weight='balanced',
                               random_state=42)
model.fit(X, y)

# Save artifacts
joblib.dump(model, 'personality_model.joblib')
joblib.dump(personality_map, 'personality_map.joblib')
print("Model trained and saved successfully")