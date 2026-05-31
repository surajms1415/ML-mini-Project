import requests
import json

base_url = "http://localhost:8000"

def test_pipeline():
    print("1. Testing Upload...")
    with open('dummy.csv', 'w') as f:
        f.write("Commodity,Price,Date\n")
        import datetime
        base_date = datetime.date(2023, 1, 1)
        for i in range(50):
            date_str = (base_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d')
            price = 100 + i + (i % 5)
            f.write(f"Potato,{price},{date_str}\n")

    files = {'file': open('dummy.csv', 'rb')}
    res = requests.post(f"{base_url}/upload", files=files)
    print("Upload:", res.json())

    print("\n2. Testing Preprocess...")
    config = {
        "target_col": "Price",
        "feature_cols": [],
        "date_col": "Date",
        "filter_potato": True
    }
    res = requests.post(f"{base_url}/preprocess", data={'config': json.dumps(config)})
    print("Preprocess:", res.json())

    print("\n3. Testing Train...")
    res = requests.post(f"{base_url}/train")
    print("Train:", res.json())
    
    train_res = res.json()
    if train_res.get("status") == "success":
        best_model = train_res["best_model"]
        print("\n4. Testing Predict with Best Model:", best_model)
        predict_data = {
            "model_name": best_model,
            "features": {
                "Year": 2023,
                "Month": 1,
                "Day": 11,
                "DayOfWeek": 2,
                "Lag_1": 125,
                "Lag_7": 108
            }
        }
        res = requests.post(f"{base_url}/predict_single", json=predict_data)
        print("Predict:", res.json())

if __name__ == "__main__":
    test_pipeline()
