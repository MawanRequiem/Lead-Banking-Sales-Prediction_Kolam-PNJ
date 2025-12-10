import numpy as np
import pandas as pd

def apply_feature_engineering(df):
    df_fe = df.copy()

    # --------------------------------------------------
    # 1. Convert yes/no → 1/0 (MUST be done BEFORE FE)
    # --------------------------------------------------
    yes_no_cols = ["housing", "loan", "default", "y"]
    for col in yes_no_cols:
        if col in df_fe.columns:
            df_fe[col] = (
                df_fe[col]
                .astype(str)
                .str.lower()
                .map({"yes": 1, "no": 0})
                .fillna(df_fe[col])   # leave values unchanged if not yes/no
            )

    # --------------------------------------------------
    # 2. Your original feature engineering
    # --------------------------------------------------

    # Numeric power features
    df_fe['balance_squared'] = df_fe['balance'] ** 2
    df_fe['age_squared'] = df_fe['age'] ** 2

    df_fe['balance_per_age'] = df_fe['balance'] / (df_fe['age'] + 1)
    df_fe['balance_age'] = df_fe['balance'] * df_fe['age']

    # Contact history
    df_fe['contacted_before'] = (df_fe['pdays'] != -1).astype(int)
    df_fe['days_since_contact'] = df_fe['pdays'].apply(lambda x: 365 if x == -1 else x)
    df_fe['contact_frequency'] = df_fe['previous'] / (df_fe['days_since_contact'] + 1)
    df_fe['contact_intensity'] = df_fe['campaign'] / (df_fe['days_since_contact'] + 1)

    # Campaign flags
    df_fe['frequent_campaign'] = (df_fe['campaign'] > 3).astype(int)
    df_fe['high_campaign'] = (df_fe['campaign'] > 5).astype(int)
    df_fe['previous_contact'] = (df_fe['previous'] > 0).astype(int)
    df_fe['campaign_per_previous'] = df_fe['campaign'] / (df_fe['previous'] + 1)

    # Age groups
    df_fe['age_group'] = pd.cut(
        df_fe['age'],
        bins=[0, 30, 40, 50, 60, 100],
        labels=['young', 'middle_young', 'middle', 'senior', 'elderly']
    )

    # Campaign group
    df_fe['campaign_group'] = pd.cut(
        df_fe['campaign'],
        bins=[0, 1, 3, 5, 100],
        labels=['first', 'low', 'medium', 'high']
    )

    # Balance flags
    df_fe['has_positive_balance'] = (df_fe['balance'] > 0).astype(int)
    df_fe['has_debt'] = (df_fe['balance'] < 0).astype(int)
    df_fe['high_balance'] = (df_fe['balance'] > df_fe['balance'].quantile(0.75)).astype(int)

    df_fe['balance_category'] = pd.cut(
        df_fe['balance'],
        bins=[-np.inf, 0, 500, 2000, np.inf],
        labels=['negative', 'low', 'medium', 'high']
    )

    # Loan-related features
    df_fe['total_loans'] = df_fe['housing'] + df_fe['loan']
    df_fe['any_loan'] = ((df_fe['housing'] == 1) | (df_fe['loan'] == 1)).astype(int)
    df_fe['no_loans'] = ((df_fe['housing'] == 0) & (df_fe['loan'] == 0)).astype(int)

    # Month features
    high_success_months = ['mar', 'sep', 'oct', 'dec']
    df_fe['high_success_month'] = df_fe['month'].isin(high_success_months).astype(int)

    # Demographics
    df_fe['young_professional'] = ((df_fe['age'] >= 25) & (df_fe['age'] <= 40)).astype(int)
    df_fe['retirement_age'] = (df_fe['age'] >= 60).astype(int)

    # Interaction features
    df_fe['balance_x_contacted'] = df_fe['balance'] * df_fe['contacted_before']
    df_fe['age_x_balance_pos'] = df_fe['age'] * df_fe['has_positive_balance']

    # Drop if exists (safe)
    df_fe = df_fe.drop(columns=['balance_to_avg_ratio'], errors='ignore')

    return df_fe
