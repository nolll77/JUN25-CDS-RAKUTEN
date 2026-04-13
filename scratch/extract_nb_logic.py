import json
import os

notebook_path = "notebooks/nb2_preprocessing.ipynb"
search_terms = ["get_text_metrics", "hstack", "X_final", "X_text_features"]

if os.path.exists(notebook_path):
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        for cell in nb['cells']:
            if cell['cell_type'] == 'code':
                source = "".join(cell['source'])
                if any(term in source for term in search_terms):
                    print(f"--- Cell found ---")
                    print(source)
                    print("-" * 50)
else:
    print(f"File {notebook_path} not found.")
