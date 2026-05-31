import zipfile
import os

def create_submission_zip():
    zip_filename = 'Potato_Mandi_Submission.zip'
    exclude_dirs = {'node_modules', 'venv', '__pycache__', '.git', 'dist'}
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Exclude specified directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file == zip_filename or file == 'zip_project.py' or file.endswith('.log'):
                    continue
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, '.'))
                
    print(f"Successfully created {zip_filename}!")
    print(f"Total size: {os.path.getsize(zip_filename) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    create_submission_zip()
