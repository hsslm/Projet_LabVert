import shutil
import os

frontend_dir = "src/frontend/"
data_dir = "src/data/"

os.makedirs(data_dir, exist_ok=True)

files = [
    "acceuil.html",
    "acceuil.css",
    "arrosage.html",
    "index.html",
    "index.js",
    "style.css",
    "page1.html",
    "plante.html",
    "page1.css",
    "script.js",  
    "bg.jpg"
]

print("Copie automatique du frontend vers data/...")

for f in files:
    src = os.path.join(frontend_dir, f)
    dst = os.path.join(data_dir, f)

    if os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Copié : {f}")
    else:
        print(f"INTROUVABLE : {src}")

print("Terminé.")