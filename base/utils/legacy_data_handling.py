import pandas as pd

def combine_exercises(session_data:pd.DataFrame, exercise_data:pd.DataFrame, save_dir:str=None) -> pd.DataFrame:
    exercise_data["full_name"] = exercise_data["exercise"] + " - " + exercise_data["exercise_type"]

    # Merge session data with exercises twice:
    sdata_comb = (
        session_data
        .merge(exercise_data, left_on="Exercise", right_on="exercise", how="left")
        .merge(exercise_data, left_on="Exercise", right_on="full_name", how="left", suffixes=('', '_full'))
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
    )  # Keep exercise_type column

    if save_dir:
        sdata_comb.to_csv(save_dir, index=False)
    else:
        return sdata_comb