import pandas as pd
import re

sdata = pd.read_csv("session_data_lew.csv")
exercises = pd.read_csv("exercises.csv")
exercises["full_name"] = exercises["exercise"] + " - " + exercises["exercise_type"]

# Merge session data with exercises twice:
sdata_comb = (
    sdata
    .merge(exercises, left_on="Exercise", right_on="exercise", how="left")
    .merge(exercises, left_on="Exercise", right_on="full_name", how="left", suffixes=('', '_full'))
)

# Coalesce the columns: use first merge values if available, otherwise use second merge values
sdata_comb = sdata_comb.assign(
    exercise_type=sdata_comb['exercise_type'].fillna(sdata_comb['exercise_type_full']),
    MuscleGroup=sdata_comb['MuscleGroup'].fillna(sdata_comb['MuscleGroup_full'])
)[["Date", "Exercise", "exercise_type", "MuscleGroup", "Result", "Weight", "Status"]]

# Append exercise type to Exercise name if it's not already there
sdata_comb = sdata_comb.assign(
    Exercise=sdata_comb.apply(
        lambda row: row["Exercise"] if pd.notna(row["exercise_type"]) and str(row["exercise_type"]) in row["Exercise"] 
                    else f"{row['Exercise']} - {row['exercise_type']}" if pd.notna(row["exercise_type"])
                    else row["Exercise"],
        axis=1
    )
).drop(columns=["exercise_type"])