import pandas as pd
import numpy as np
import joblib
import datetime as dt

print("Loading artifacts...")
preprocessor = joblib.load("preprocessor.pkl")
final_model = joblib.load("model.pkl")

# -----------------------------
# LOAD DATA FOR PREDICTION
# -----------------------------
print("Loading new data...")
df_raw = pd.read_csv("bank-full.csv", sep=";")   # <— YOUR INPUT FILE

# -----------------------------
# APPLY FEATURE ENGINEERING
# -----------------------------
from prediction_feature_engineering import apply_feature_engineering
print("Applying feature engineering...")
df = apply_feature_engineering(df_raw)

# Keep independent variables
X = df.copy()

# -----------------------------
# PREPROCESS + RUN MODEL
# -----------------------------
print("Transforming...")
X_prepared = preprocessor.transform(X)

print("Predicting...")
proba = final_model.predict_proba(X_prepared)[:, 1]

# -----------------------------
# BUILD RECOMMENDATION DATAFRAME
# -----------------------------
df_rekom = df_raw.copy()   # Use original customer info

df_rekom["prob_subscription"] = proba.round(3)
df_rekom["score"] = (1 + proba * 9).round(3)
df_rekom = df_rekom.sort_values("prob_subscription", ascending=False).reset_index(drop=True)
df_rekom["global_rank"] = df_rekom.index + 1

def get_priority_level(p):
    if p >= 0.7:
        return "HIGH"
    elif p >= 0.4:
        return "MEDIUM"
    else:
        return "LOW"

df_rekom["priority_level"] = df_rekom["prob_subscription"].apply(get_priority_level)

# -----------------------------
# SAVE OUTPUT
# -----------------------------
df_rekom.to_csv("output/customer_recommendations.csv", index=False)
print("✓ Saved: output/customer_recommendations.csv")

# -----------------------------
# DAILY RECOMMENDATION
# -----------------------------
def get_daily_recommendation(df_sorted, date_str, calls_per_day=200):
    n = len(df_sorted)
    base_date = dt.date(2025, 1, 1)
    target_date = pd.to_datetime(date_str).date()

    day_offset = (target_date - base_date).days
    start_idx = (day_offset * calls_per_day) % n
    end_idx = start_idx + calls_per_day

    if end_idx <= n:
        df_day = df_sorted.iloc[start_idx:end_idx].copy()
    else:
        part1 = df_sorted.iloc[start_idx:]
        part2 = df_sorted.iloc[:end_idx - n]
        df_day = pd.concat([part1, part2]).copy()

    df_day = df_day.reset_index(drop=True)
    df_day["daily_rank"] = df_day.index + 1
    return df_day

target_date = "2025-01-01"
df_day = get_daily_recommendation(df_rekom, target_date)

df_day.to_csv(f"output/recommendations_{target_date}.csv", index=False)
print(f"✓ Saved: output/recommendations_{target_date}.csv")
