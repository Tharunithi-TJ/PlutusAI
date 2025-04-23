import os
from werkzeug.utils import secure_filename

class DocumentStorage:
    def __init__(self, upload_folder, allowed_extensions):
        self.upload_folder = upload_folder
        self.allowed_extensions = allowed_extensions
    
    def save_document(self, file):
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(self.upload_folder, filename)
        file.save(file_path)
        return file_path
    
    def is_allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions 