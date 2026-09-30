/*
==========================================================
LOG HARDWARE
Google Drive Image Upload
==========================================================

This file uploads product images directly to Google Drive.

Authentication:
Google OAuth 2.0

Folder:
Log HARDWARE Images

==========================================================
*/


const GOOGLE_DRIVE_UPLOAD_CONFIG = {

    /*
     * Your Google Cloud OAuth 2.0
     * Web Application Client ID.
     *
     * Replace this value.
     */
    CLIENT_ID:
        "977268075453-u44242ti0q8eunhv5ftnkv3ku5ouhc11.apps.googleusercontent.com",


    /*
     * Your Google Drive folder ID.
     */
    FOLDER_ID:
        "1bKz5OdLYc6XTXeT-9FjgA8iceKlKyWAZ",


    /*
     * Permission required for creating files
     * in Google Drive.
     */
    SCOPES:
        "https://www.googleapis.com/auth/drive.file"

};


const GoogleDriveUploader = {

    tokenClient: null,

    accessToken: null,

    initialized: false,


    /*
    ------------------------------------------------------
    Initialize Google Identity Services
    ------------------------------------------------------
    */

    init: function () {

        if (
            typeof google === "undefined" ||
            !google.accounts ||
            !google.accounts.oauth2
        ) {

            console.error(
                "Google Identity Services did not load."
            );

            return;

        }


        this.tokenClient =
            google.accounts.oauth2.initTokenClient({

                client_id:
                    GOOGLE_DRIVE_UPLOAD_CONFIG.CLIENT_ID,

                scope:
                    GOOGLE_DRIVE_UPLOAD_CONFIG.SCOPES,

                callback: (response) => {

                    if (response.error) {

                        console.error(
                            "Google OAuth error:",
                            response
                        );

                        return;

                    }

                    this.accessToken =
                        response.access_token;

                    console.log(
                        "Google Drive authentication successful."
                    );

                }

            });


        this.initialized = true;

    },


    /*
    ------------------------------------------------------
    Sign in
    ------------------------------------------------------
    */

    signIn: function () {

        return new Promise((resolve, reject) => {

            if (!this.initialized) {

                reject(
                    new Error(
                        "Google authentication is not initialized. Please refresh the page."
                    )
                );

                return;
            }


            this.tokenClient.callback =
                (response) => {

                    if (response.error) {

                        console.error(response);

                        reject(
                            new Error(
                                "Google sign-in failed. Please try again."
                            )
                        );

                        return;
                    }


                    this.accessToken =
                        response.access_token;


                    resolve(response);

                };


            this.tokenClient.requestAccessToken({

                prompt:
                    this.accessToken
                        ? ""
                        : "consent"

            });

        });

    },


    /*
    ------------------------------------------------------
    Sign out
    ------------------------------------------------------
    */

    signOut: function () {

        if (!this.accessToken) {
            return;
        }


        google.accounts.oauth2.revoke(
            this.accessToken,
            () => {

                console.log(
                    "Google Drive access revoked."
                );

            }
        );


        this.accessToken = null;

    },


    /*
    ------------------------------------------------------
    Check authentication
    ------------------------------------------------------
    */

    isSignedIn: function () {

        return Boolean(this.accessToken);

    },


    /*
    ------------------------------------------------------
    Upload image
    ------------------------------------------------------
    */

    uploadImage: async function (
        originalFile,
        filename
    ) {

        if (!this.accessToken) {

            throw new Error(
                "Please connect Google Drive first."
            );

        }


        if (!originalFile) {

            throw new Error(
                "No image selected."
            );

        }


        /*
         * Create a new File object with the generated
         * filename.
         */
        const renamedFile =
            new File(
                [originalFile],
                filename,
                {
                    type:
                        originalFile.type ||
                        "image/jpeg"
                }
            );


        /*
         * Metadata tells Google Drive:
         *
         * name = generated filename
         * parents = Log HARDWARE Images folder
         */
        const metadata = {

            name: filename,

            mimeType:
                renamedFile.type,

            parents: [
                GOOGLE_DRIVE_UPLOAD_CONFIG.FOLDER_ID
            ]

        };


        /*
         * Use multipart upload.
         *
         * Google documents multipart upload for small
         * files and resumable upload for larger files.
         */
        const boundary =
            "-------314159265358979323846";


        const delimiter =
            `\r\n--${boundary}\r\n`;


        const closeDelimiter =
            `\r\n--${boundary}--`;


        const multipartBody =
            new Blob([

                `--${boundary}\r\n`,

                "Content-Type: application/json; charset=UTF-8\r\n\r\n",

                JSON.stringify(metadata),

                delimiter,

                `Content-Type: ${renamedFile.type}\r\n\r\n`,

                renamedFile,

                closeDelimiter

            ]);


        const response =
            await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${this.accessToken}`,

                        "Content-Type":
                            `multipart/related; boundary=${boundary}`

                    },

                    body:
                        multipartBody

                }
            );


        /*
         * Token expired.
         */
        if (response.status === 401) {

            this.accessToken = null;

            throw new Error(
                "Google Drive session expired. Please connect Google Drive again."
            );

        }


        /*
         * Permission error.
         */
        if (response.status === 403) {

            let errorText = "";

            try {

                const errorData =
                    await response.json();

                errorText =
                    errorData.error?.message || "";

            } catch (e) {

                // Ignore JSON parsing error.
            }


            throw new Error(
                "Google Drive permission denied. " +
                "Make sure the signed-in Google account owns or can edit the Log HARDWARE Images folder." +
                (errorText
                    ? ` (${errorText})`
                    : "")
            );

        }


        /*
         * Other error.
         */
        if (!response.ok) {

            let message =
                `Upload failed (${response.status}).`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData.error &&
                    errorData.error.message
                ) {

                    message +=
                        ` ${errorData.error.message}`;

                }

            } catch (e) {

                // Ignore parsing error.
            }


            throw new Error(message);

        }


        /*
         * Successful upload.
         */
        const result =
            await response.json();


        return result;

    }

};


/* ==========================================================
   LOG HARDWARE - SHARED WHATSAPP
   ========================================================== */

const LOG_HARDWARE_WHATSAPP = "919999999999";
// Replace the number above with the real WhatsApp number.
// Keep country code, without + or spaces.

function openWhatsAppMessage(message) {
    const phone = LOG_HARDWARE_WHATSAPP;

    if (!phone || phone === "919999999999") {
        console.warn(
            "LOG HARDWARE: Replace LOG_HARDWARE_WHATSAPP in app.js with the real WhatsApp number."
        );
    }

    const url =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
}

function openStoreWhatsApp() {
    const message =
        "Hello LOG HARDWARE,\n\n" +
        "I need help finding a spare part.\n" +
        "Please help me with availability and price.";

    openWhatsAppMessage(message);
}
