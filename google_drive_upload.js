/*
==========================================================
LOG HARDWARE
Google Drive Image Upload
==========================================================

Purpose:
Upload product images directly to the "Log HARDWARE Images"
Google Drive folder using Google OAuth 2.0.

IMPORTANT:
The CLIENT_ID must exactly match the Web Application OAuth
client ID from Google Cloud Console.
==========================================================
*/

const GOOGLE_DRIVE_UPLOAD_CONFIG = {
    CLIENT_ID:
        "977268075453-u44242ti0q8eunhv5ftnkv3ku5ouhc11.apps.googleusercontent.com",

    FOLDER_ID:
        "1bKz5OdLYc6XTXeT-9FjgA8iceKlKyWAZ",

    SCOPES:
        "https://www.googleapis.com/auth/drive.file"
};


const GoogleDriveUploader = {

    tokenClient: null,
    accessToken: null,
    initialized: false,
    tokenRequestInProgress: false,


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
            return false;
        }

        try {

            this.tokenClient =
                google.accounts.oauth2.initTokenClient({

                    client_id:
                        GOOGLE_DRIVE_UPLOAD_CONFIG.CLIENT_ID,

                    scope:
                        GOOGLE_DRIVE_UPLOAD_CONFIG.SCOPES,

                    callback: () => {
                        /*
                         * The callback is assigned again inside
                         * signIn/requestAccessToken because each
                         * request needs its own Promise result.
                         */
                    }

                });

            this.initialized = true;

            console.log(
                "Google Identity Services initialized."
            );

            return true;

        } catch (error) {

            console.error(
                "Google Identity Services initialization failed:",
                error
            );

            this.initialized = false;
            this.tokenClient = null;

            return false;
        }
    },


    /*
    ------------------------------------------------------
    Sign in
    ------------------------------------------------------
    */
    signIn: function () {

        return new Promise((resolve, reject) => {

            if (!this.initialized || !this.tokenClient) {

                reject(
                    new Error(
                        "Google authentication is not initialized. Please refresh the page."
                    )
                );

                return;
            }

            if (this.tokenRequestInProgress) {
                reject(
                    new Error(
                        "Google sign-in is already in progress."
                    )
                );
                return;
            }

            this.tokenRequestInProgress = true;

            this.tokenClient.callback =
                (response) => {

                    this.tokenRequestInProgress = false;

                    if (
                        !response ||
                        response.error ||
                        !response.access_token
                    ) {

                        console.error(
                            "Google OAuth error:",
                            response
                        );

                        this.accessToken = null;

                        reject(
                            new Error(
                                response?.error_description ||
                                response?.error ||
                                "Google sign-in failed. Please try again."
                            )
                        );

                        return;
                    }

                    this.accessToken =
                        response.access_token;

                    console.log(
                        "Google Drive authentication successful."
                    );

                    resolve(response);
                };

            try {

                this.tokenClient.requestAccessToken({
                    prompt: this.accessToken
                        ? ""
                        : "consent"
                });

            } catch (error) {

                this.tokenRequestInProgress = false;

                console.error(
                    "Google sign-in request failed:",
                    error
                );

                reject(
                    new Error(
                        "Unable to open Google sign-in. Please try again."
                    )
                );
            }
        });
    },


    /*
    ------------------------------------------------------
    Sign out
    ------------------------------------------------------
    */
    signOut: function () {

        if (this.accessToken) {

            try {

                google.accounts.oauth2.revoke(
                    this.accessToken,
                    () => {
                        console.log(
                            "Google Drive access revoked."
                        );
                    }
                );

            } catch (error) {

                console.warn(
                    "Google revoke warning:",
                    error
                );
            }
        }

        this.accessToken = null;
        this.tokenRequestInProgress = false;
    },


    /*
    ------------------------------------------------------
    Check authentication
    ------------------------------------------------------
    */
    isSignedIn: function () {

        return Boolean(
            this.accessToken &&
            typeof this.accessToken === "string"
        );
    },


    /*
    ------------------------------------------------------
    Get a valid access token
    ------------------------------------------------------
    */
    getAccessToken: async function () {

        if (this.isSignedIn()) {
            return this.accessToken;
        }

        /*
         * If there is no token, request a new one.
         * This prevents the upload page from getting stuck
         * on "Please connect Google Drive first."
         */
        try {

            const response =
                await this.signIn();

            if (
                response &&
                response.access_token
            ) {
                return response.access_token;
            }

        } catch (error) {

            throw error;
        }

        throw new Error(
            "Google Drive authentication is required."
        );
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

        if (!originalFile) {

            throw new Error(
                "No image selected."
            );
        }

        if (!filename) {

            throw new Error(
                "A filename is required."
            );
        }

        /*
         * Get the current OAuth token.
         */
        let token =
            await this.getAccessToken();


        /*
         * Create a new File object using the generated
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
         * Google Drive file metadata.
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
         * Multipart upload.
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


        const uploadUrl =
            "https://www.googleapis.com/upload/drive/v3/files" +
            "?uploadType=multipart" +
            "&fields=id,name,mimeType,webViewLink";


        /*
         * Perform upload.
         */
        let response =
            await fetch(
                uploadUrl,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            `multipart/related; boundary=${boundary}`
                    },

                    body: multipartBody
                }
            );


        /*
         * Token expired/invalid.
         *
         * Request a fresh token once and retry the upload.
         */
        if (response.status === 401) {

            console.warn(
                "Google access token expired. Requesting a new token..."
            );

            this.accessToken = null;

            token =
                await this.getAccessToken();


            response =
                await fetch(
                    uploadUrl,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                `multipart/related; boundary=${boundary}`
                        },

                        body: multipartBody
                    }
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
                    errorData?.error?.message ||
                    "";

            } catch (error) {
                // Ignore JSON parsing failure.
            }

            throw new Error(
                "Google Drive permission denied. " +
                "Make sure the signed-in Google account has access to the " +
                "Log HARDWARE Images folder." +
                (
                    errorText
                        ? ` (${errorText})`
                        : ""
                )
            );
        }


        /*
         * Other API errors.
         */
        if (!response.ok) {

            let message =
                `Upload failed (${response.status}).`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData?.error?.message
                ) {

                    message +=
                        ` ${errorData.error.message}`;
                }

            } catch (error) {

                // Ignore JSON parsing failure.
            }

            throw new Error(message);
        }


        /*
         * Successful upload.
         */
        const result =
            await response.json();

        console.log(
            "Google Drive upload successful:",
            result
        );

        return result;
    }
};


/*
----------------------------------------------------------
Make sure the object is available globally.
----------------------------------------------------------
*/
window.GoogleDriveUploader =
    GoogleDriveUploader;
