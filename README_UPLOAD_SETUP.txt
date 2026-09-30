LOG HARDWARE - Product Image Upload Page

Files:
- index.html
- product.html
- styles.css
- app.js
- google_drive.js
- upload.html
- google_drive_upload.js

IMPORTANT:
The existing google_drive.js is for reading publicly accessible Drive images.
The new upload page uses Google OAuth 2.0 because an API key alone cannot upload
files into a user's private Drive folder.

Google Cloud setup:
1. Enable Google Drive API.
2. Configure Google Auth Platform / OAuth consent screen.
3. Create OAuth Client ID -> Web application.
4. Authorized JavaScript origins:
   https://syednazeerahmed633237-collab.github.io
5. Put the OAuth Client ID in google_drive_upload.js:
   CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
6. Keep the folder ID:
   1bKz5OdLYc6XTXeT-9FjgA8iceKlKyWAZ

Upload page:
upload.html

Filename is generated automatically:
product-C-category-B-brand-S-size.ext

Example:
lg-refrigerator-adjustable-heavy-duty-stand-C-refrigerator-B-lg-S-cls32170401.jpg

Camera:
The page uses <input type="file" accept="image/*" capture="environment">.
On supported mobile browsers this opens the device camera.

No SQL/PHP/backend is required for this uploader.
