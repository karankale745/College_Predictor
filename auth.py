from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from google.oauth2 import id_token

from google.auth.transport import requests as google_requests

from datetime import timedelta
from dotenv import load_dotenv

import hashlib
import secrets
import os

from database import get_db, utc_now


# Load .env before reading Google settings.
load_dotenv()


auth_bp = Blueprint(
    "auth",
    __name__
)


GOOGLE_CLIENT_ID = (
    os.getenv("GOOGLE_CLIENT_ID", "")
    .strip()
    .strip('"')
    .strip("'")
)


def login_user(user):

    session.clear()

    session["user_id"] = user["id"]

    session["user_name"] = user["name"]

    session["user_email"] = user["email"]

    session.permanent = True


@auth_bp.route("/login")
def login_page():

    if session.get("user_id"):

        return redirect("/")

    return render_template(
        "login.html",
        google_client_id=GOOGLE_CLIENT_ID
    )


@auth_bp.route("/register")
def register_page():

    return render_template(
        "register.html"
    )


@auth_bp.route(
    "/api/register",
    methods=["POST"]
)
def register_api():

    data = request.get_json() or {}

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    if not name:

        return jsonify({
            "error": "Enter your name."
        }), 400


    if (
        not email
        or
        "@" not in email
    ):

        return jsonify({
            "error": "Enter a valid email."
        }), 400


    if len(password) < 8:

        return jsonify({
            "error":
            "Password must contain at least 8 characters."
        }), 400


    conn = get_db()

    old_user = conn.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()


    if old_user:

        conn.close()

        return jsonify({
            "error":
            "An account already exists with this email."
        }), 409


    password_hash = generate_password_hash(
        password
    )


    cursor = conn.execute(
        """
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            auth_provider,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            name,
            email,
            password_hash,
            "email",
            utc_now().isoformat()
        )
    )

    user_id = cursor.lastrowid

    conn.commit()


    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()

    login_user(user)

    conn.close()


    return jsonify({
        "success": True
    })


@auth_bp.route(
    "/api/login",
    methods=["POST"]
)
def login_api():

    data = request.get_json() or {}

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    conn = get_db()

    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()


    if (
        not user
        or
        not user["password_hash"]
        or
        not check_password_hash(
            user["password_hash"],
            password
        )
    ):

        conn.close()

        return jsonify({
            "error":
            "Invalid email or password."
        }), 401


    login_user(user)

    conn.close()


    return jsonify({
        "success": True
    })


@auth_bp.route(
    "/api/google-login",
    methods=["POST"]
)
def google_login():

    data = request.get_json() or {}

    credential = data.get(
        "credential"
    )


    if not credential:

        return jsonify({
            "error":
            "Google credential missing."
        }), 400


    if not GOOGLE_CLIENT_ID:

        print("GOOGLE AUTH ERROR: GOOGLE_CLIENT_ID is missing.")

        return jsonify({
            "error":
            "Google login configuration is missing."
        }), 500


    try:

        info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError as error:

        print(
            "GOOGLE TOKEN VERIFY ERROR:",
            repr(error)
        )

        return jsonify({
            "error":
            "Google token verification failed. Check GOOGLE_CLIENT_ID and Google Web Client settings."
        }), 401

    except Exception as error:

        print(
            "GOOGLE AUTH ERROR:",
            type(error).__name__,
            repr(error)
        )

        return jsonify({
            "error":
            "Google authentication failed. Check Flask terminal for the exact error."
        }), 401


    token_audience = str(
        info.get("aud", "")
    ).strip()


    if token_audience != GOOGLE_CLIENT_ID:

        print(
            "GOOGLE AUDIENCE MISMATCH:",
            token_audience
        )

        return jsonify({
            "error":
            "Google Client ID mismatch."
        }), 401


    if not info.get("email_verified"):

        return jsonify({
            "error":
            "Google email is not verified."
        }), 401


    google_sub = info["sub"]

    email = info["email"].lower()

    name = info.get(
        "name",
        email.split("@")[0]
    )


    conn = get_db()


    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE google_sub = ?
        OR email = ?
        """,
        (
            google_sub,
            email
        )
    ).fetchone()


    if not user:

        cursor = conn.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                google_sub,
                auth_provider,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                name,
                email,
                google_sub,
                "google",
                utc_now().isoformat()
            )
        )

        user_id = cursor.lastrowid

        conn.commit()


        user = conn.execute(
            """
            SELECT *
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()

    else:

        if not user["google_sub"]:

            conn.execute(
                """
                UPDATE users
                SET google_sub = ?
                WHERE id = ?
                """,
                (
                    google_sub,
                    user["id"]
                )
            )

            conn.commit()


            user = conn.execute(
                """
                SELECT *
                FROM users
                WHERE id = ?
                """,
                (user["id"],)
            ).fetchone()


    login_user(user)

    conn.close()


    return jsonify({
        "success": True
    })


@auth_bp.route("/logout")
def logout():

    session.clear()

    return redirect("/")


@auth_bp.route("/forgot-password")
def forgot_password_page():

    return render_template(
        "forgot_password.html"
    )


@auth_bp.route(
    "/api/forgot-password",
    methods=["POST"]
)
def forgot_password_api():

    data = request.get_json() or {}

    email = str(
        data.get("email", "")
    ).strip().lower()


    conn = get_db()

    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()


    # Same response prevents account enumeration

    if not user:

        conn.close()

        return jsonify({
            "success": True,
            "message":
            "If an account exists, reset instructions have been created."
        })


    raw_token = secrets.token_urlsafe(
        48
    )

    token_hash = hashlib.sha256(
        raw_token.encode()
    ).hexdigest()


    expires_at = (
        utc_now()
        +
        timedelta(minutes=30)
    )


    conn.execute(
        """
        INSERT INTO password_resets
        (
            user_id,
            token_hash,
            expires_at,
            used,
            created_at
        )
        VALUES (?, ?, ?, 0, ?)
        """,
        (
            user["id"],
            token_hash,
            expires_at.isoformat(),
            utc_now().isoformat()
        )
    )

    conn.commit()

    conn.close()


    # DEVELOPMENT ONLY
    # Later send this URL through email.

    reset_url = url_for(
        "auth.reset_password_page",
        token=raw_token,
        _external=True
    )


    print(
        "PASSWORD RESET URL:",
        reset_url
    )


    return jsonify({
        "success": True,
        "message":
        "If an account exists, reset instructions have been created."
    })


@auth_bp.route(
    "/reset-password/<token>"
)
def reset_password_page(token):

    return render_template(
        "reset_password.html",
        token=token
    )


@auth_bp.route(
    "/api/reset-password",
    methods=["POST"]
)
def reset_password_api():

    data = request.get_json() or {}

    token = str(
        data.get("token", "")
    )

    password = str(
        data.get("password", "")
    )


    if len(password) < 8:

        return jsonify({
            "error":
            "Password must contain at least 8 characters."
        }), 400


    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()


    conn = get_db()


    reset = conn.execute(
        """
        SELECT *
        FROM password_resets
        WHERE token_hash = ?
        AND used = 0
        """,
        (token_hash,)
    ).fetchone()


    if not reset:

        conn.close()

        return jsonify({
            "error":
            "Reset link is invalid."
        }), 400


    from datetime import datetime


    expires_at = datetime.fromisoformat(
        reset["expires_at"]
    )


    if utc_now() > expires_at:

        conn.close()

        return jsonify({
            "error":
            "Reset link has expired."
        }), 400


    password_hash = generate_password_hash(
        password
    )


    conn.execute(
        """
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        """,
        (
            password_hash,
            reset["user_id"]
        )
    )


    conn.execute(
        """
        UPDATE password_resets
        SET used = 1
        WHERE id = ?
        """,
        (reset["id"],)
    )


    conn.commit()

    conn.close()


    return jsonify({
        "success": True
    })


@auth_bp.route("/api/me")
def current_user():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return jsonify({
            "logged_in": False
        })


    return jsonify({

        "logged_in": True,

        "name":
            session.get("user_name"),

        "email":
            session.get("user_email")

    })