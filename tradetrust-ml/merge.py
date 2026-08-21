import pandas as pd
import os

raw_path = "data/raw/"
processed_path = "data/processed/"

all_files = [f for f in os.listdir(raw_path) if f.endswith(".csv")]

df_list = []

for file in all_files:
    df = pd.read_csv(os.path.join(raw_path, file))
    df_list.append(df)

master_df = pd.concat(df_list, ignore_index=True)

print("Total rows after merge:", master_df.shape[0])

master_df.to_csv(os.path.join(processed_path, "smartbuy_master_dataset.csv"), index=False)

print("Master dataset created successfully.")