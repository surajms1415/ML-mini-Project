from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
import json
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pickle
import os

app = FastAPI(title="Potato Mandi Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for dataset to avoid passing it back and forth
dataset_cache = {}

@app.get("/")
def read_root():
    return {"message": "Welcome to Potato Mandi Analytics API"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # We can perform a quick check
        columns = df.columns.tolist()
        
        # Save to cache
        dataset_cache['data'] = df
        
        return {
            "status": "success",
            "filename": file.filename,
            "columns": columns,
            "preview": df.head(5).to_dict(orient='records'),
            "total_rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/use_demo")
async def use_demo(dataset_name: str = Form(default="Potato.csv")):
    try:
        # Path to the dummy folder which is one level up
        folder_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dummy")
        file_path = os.path.join(folder_path, dataset_name)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail=f"Demo dataset {dataset_name} not found in dummy folder")
        
        df = pd.read_csv(file_path)
        columns = df.columns.tolist()
        dataset_cache['data'] = df
        
        return {
            "status": "success",
            "filename": f"{dataset_name} (Demo Dataset)",
            "columns": columns,
            "preview": df.head(5).to_dict(orient='records'),
            "total_rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/preprocess")
async def preprocess(config: str = Form(...)):
    # config is a json string containing target_col, feature_cols, date_col
    try:
        if 'data' not in dataset_cache:
            raise HTTPException(status_code=400, detail="No dataset uploaded")
            
        params = json.loads(config)
        df = dataset_cache['data'].copy()
        
        target = params.get("target_col")
        features = params.get("feature_cols", [])
        date_col = params.get("date_col")
        filter_potato = params.get("filter_potato", True)
        
        if filter_potato and 'Commodity' in df.columns:
            df = df[df['Commodity'].str.lower() == 'potato']
            
        # Handle Missing Values
        df = df.dropna(subset=[target])
        df = df.ffill().bfill()
        
        # Date processing
        if date_col and date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df['Year'] = df[date_col].dt.year
            df['Month'] = df[date_col].dt.month
            df['Day'] = df[date_col].dt.day
            df['DayOfWeek'] = df[date_col].dt.dayofweek
            
            # Lag features
            df = df.sort_values(by=date_col)
            df['Lag_1'] = df[target].shift(1)
            df['Lag_7'] = df[target].shift(7)
            df = df.dropna()
            
            # Update features
            new_features = ['Year', 'Month', 'Day', 'DayOfWeek', 'Lag_1', 'Lag_7']
            for f in new_features:
                if f not in features:
                    features.append(f)
                    
        # Keep only the target and the selected features (date_col was already processed)
        cols_to_keep = [target] + [f for f in features if f in df.columns]
        df = df[cols_to_keep]
        
        # Encode categorical
        cat_cols = df.select_dtypes(include=['object']).columns
        df = pd.get_dummies(df, columns=cat_cols, drop_first=True)
        
        # Update features list to include dummies
        final_features = [c for c in df.columns if c != target]
        original_features = [c for c in cols_to_keep if c != target]
        
        dataset_cache['processed_data'] = df
        dataset_cache['features'] = final_features
        dataset_cache['original_features'] = original_features
        dataset_cache['target'] = target
        
        return {
            "status": "success",
            "message": "Data preprocessed successfully",
            "features_used": final_features,
            "processed_rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/train")
async def train_models():
    try:
        if 'processed_data' not in dataset_cache:
            raise HTTPException(status_code=400, detail="Data not preprocessed")
            
        df = dataset_cache['processed_data']
        features = dataset_cache['features']
        target = dataset_cache['target']
        
        X = df[features]
        y = df[target]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        models = {
            "Linear Regression": LinearRegression(),
            "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
            "SVR": SVR(kernel='rbf')
        }
        
        results = {}
        predictions = {}
        
        for name, model in models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            # CV
            cv_splits = min(5, max(2, len(X) // 2))
            if cv_splits >= 2:
                cv_scores = cross_val_score(model, X, y, cv=cv_splits, scoring='neg_mean_squared_error')
                cv_rmse = np.mean(np.sqrt(-cv_scores))
            else:
                cv_rmse = 0.0
            
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            rmse_val = float(rmse) if not np.isnan(rmse) else None
            mae_val = float(mae) if not np.isnan(mae) else None
            r2_val = float(r2) if not np.isnan(r2) else None
            cv_rmse_val = float(cv_rmse) if not np.isnan(cv_rmse) else None
            
            results[name] = {
                "RMSE": rmse_val,
                "MAE": mae_val,
                "R2": r2_val,
                "CV_RMSE": cv_rmse_val
            }
            predictions[name] = y_pred.tolist()[:50] # Send sample for graphs
            
        dataset_cache['models'] = models
        dataset_cache['y_test_sample'] = y_test.tolist()[:50]
        dataset_cache['y_pred'] = predictions
        
        def get_r2(k):
            val = results[k]['R2']
            return val if val is not None else -float('inf')
            
        best_model = max(results.keys(), key=get_r2)
        
        return {
            "status": "success",
            "results": results,
            "best_model": best_model,
            "sample_actual": dataset_cache['y_test_sample'],
            "sample_predictions": predictions,
            "features": dataset_cache.get('original_features', features)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from pydantic import BaseModel
from typing import Dict, Any

class PredictRequest(BaseModel):
    model_name: str
    features: Dict[str, Any]

@app.post("/predict_single")
async def predict_single(req: PredictRequest):
    try:
        if 'models' not in dataset_cache:
            raise HTTPException(status_code=400, detail="Models not trained")
            
        model = dataset_cache['models'].get(req.model_name)
        if not model:
            raise HTTPException(status_code=400, detail="Model not found")
            
        expected_features = dataset_cache['features']
        original_features = dataset_cache.get('original_features', expected_features)
        
        # Build the input array in the correct order
        input_data = []
        for f in expected_features:
            # If it's an exact match (e.g. numerical columns)
            if f in req.features:
                try:
                    input_data.append(float(req.features[f]))
                except (ValueError, TypeError):
                    input_data.append(0.0)
            else:
                # It might be a one-hot encoded dummy column: "ColumnName_CategoryValue"
                # Find which original categorical feature this belongs to
                matched = False
                for orig_f in original_features:
                    prefix = f"{orig_f}_"
                    if f.startswith(prefix):
                        expected_cat_value = f[len(prefix):]
                        actual_cat_value = str(req.features.get(orig_f, ""))
                        if actual_cat_value == expected_cat_value:
                            input_data.append(1.0)
                        else:
                            input_data.append(0.0)
                        matched = True
                        break
                
                if not matched:
                    # Feature not provided or not recognized, default to 0
                    input_data.append(0.0)
                
        # Predict
        prediction = model.predict([input_data])[0]
        
        return {
            "status": "success",
            "prediction": float(prediction)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
