import pandas as pd
import re

def combine_exercises(session_data:pd.DataFrame, exercise_data:pd.DataFrame, save_dir:str=None) -> pd.DataFrame:
    exercise_data["full_name"] = exercise_data["exercise"] + " - " + exercise_data["exercise_type"]
    
    # Extract legacy exercise names by removing " - <type>" suffix from session data
    session_data = session_data.copy()
    types = ['Barbell', 'Dumbell', 'Cable', 'Machine', 'Smith', 'Kettlebell', 'Body', 'Erg', 'Run', 'Bike', 'T-Bar', 'Plate']
    type_pattern = r' - (' + '|'.join(re.escape(t) for t in types) + r')$'
    session_data['Exercise_legacy'] = session_data['Exercise'].str.replace(type_pattern, '', regex=True)

    # Merge session data with exercises using legacy names:
    sdata_comb = (
        session_data
        .merge(exercise_data, left_on="Exercise_legacy", right_on="exercise", how="left")
        .merge(exercise_data, left_on="Exercise", right_on="full_name", how="left", suffixes=('', '_full'))
    )
    # Coalesce the columns: use first merge values if available, otherwise use second merge values
    sdata_comb = sdata_comb.assign(
        exercise_type=sdata_comb['exercise_type'].fillna(sdata_comb['exercise_type_full']),
        MuscleGroup=sdata_comb['MuscleGroup'].fillna(sdata_comb['MuscleGroup_full'])
    )[["Date", "Exercise_legacy", "exercise_type", "MuscleGroup", "Result", "Weight", "Status"]]
    
    # Rename Exercise_legacy back to Exercise
    sdata_comb = sdata_comb.rename(columns={'Exercise_legacy': 'Exercise'})

    if save_dir:
        sdata_comb.to_csv(save_dir, index=False)
    else:
        return sdata_comb