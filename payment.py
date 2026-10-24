from flask import (
    Blueprint,
    jsonify,
    request,
    session,
    render_template
)

from datetime import timedelta

import os
import razorpay

from database import (
    get_db,
    utc_now
)


# ==========================================
# PAYMENT BLUEPRINT
# ==========================================

payment_bp = Blueprint(
    "payment",
    __name__
)


# ==========================================
# ENV SETTINGS
# ==========================================

RAZORPAY_KEY_ID = os.getenv(
    "RAZORPAY_KEY_ID"
)

RAZORPAY_KEY_SECRET = os.getenv(
    "RAZORPAY_KEY_SECRET"
)

ACCESS_PRICE = int(
    os.getenv(
        "ACCESS_PRICE",
        "20"
    )
)


# ==========================================
# RAZORPAY CLIENT
# ==========================================

razorpay_client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


# ==========================================
# CHECK ACTIVE ACCESS
# ==========================================

def has_active_access(user_id):

    conn = get_db()

    subscription = conn.execute(
        """
        SELECT *
        FROM subscriptions
        WHERE user_id = ?
        AND status = 'active'
        AND ends_at > ?
        ORDER BY ends_at DESC
        LIMIT 1
        """,
        (
            user_id,
            utc_now().isoformat()
        )
    ).fetchone()

    conn.close()

    return subscription is not None


# ==========================================
# REQUIRE ACCESS
# ==========================================

def require_access():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "locked": True,
            "reason": "login_required"
        }), 401

    if not has_active_access(
        user_id
    ):

        return jsonify({
            "locked": True,
            "reason": "subscription_required"
        }), 403

    return None


# ==========================================
# UNLOCK PAGE
# ==========================================

@payment_bp.route("/unlock")
def unlock_page():

    if not session.get("user_id"):

        return render_template(
            "login.html",
            google_client_id=os.getenv(
                "GOOGLE_CLIENT_ID"
            )
        )

    if has_active_access(
        session["user_id"]
    ):

        return render_template(
            "payment.html",
            razorpay_key_id=RAZORPAY_KEY_ID,
            price=ACCESS_PRICE,
            already_active=True
        )

    return render_template(
        "payment.html",
        razorpay_key_id=RAZORPAY_KEY_ID,
        price=ACCESS_PRICE,
        already_active=False
    )


# ==========================================
# CREATE RAZORPAY ORDER
# ==========================================

@payment_bp.route(
    "/api/create-order",
    methods=["POST"]
)
def create_order():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "error": "Login required."
        }), 401

    if has_active_access(
        user_id
    ):

        return jsonify({
            "already_active": True
        })

    if (
        not RAZORPAY_KEY_ID
        or
        not RAZORPAY_KEY_SECRET
    ):

        return jsonify({
            "error":
                "Razorpay API keys are not configured."
        }), 500

    amount_paise = (
        ACCESS_PRICE * 100
    )

    try:

        order = (
            razorpay_client
            .order
            .create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt":
                    f"user_{user_id}_{int(utc_now().timestamp())}",
                "notes": {
                    "user_id": str(user_id),
                    "access": "365_days"
                }
            })
        )

    except Exception as error:

        print(
            "RAZORPAY CREATE ORDER ERROR:",
            repr(error)
        )

        return jsonify({
            "error":
                "Unable to create payment order. Check Razorpay configuration."
        }), 500

    conn = get_db()

    try:

        conn.execute(
            """
            INSERT INTO subscriptions
            (
                user_id,
                razorpay_order_id,
                amount,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                order["id"],
                amount_paise,
                "created",
                utc_now().isoformat()
            )
        )

        conn.commit()

    except Exception as error:

        conn.rollback()

        print(
            "DATABASE ORDER ERROR:",
            repr(error)
        )

        return jsonify({
            "error":
                "Unable to save payment order."
        }), 500

    finally:

        conn.close()

    return jsonify({
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": RAZORPAY_KEY_ID
    })


# ==========================================
# VERIFY PAYMENT
# ==========================================

@payment_bp.route(
    "/api/verify-payment",
    methods=["POST"]
)
def verify_payment():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "error": "Login required."
        }), 401

    data = request.get_json() or {}

    order_id = data.get(
        "razorpay_order_id"
    )

    payment_id = data.get(
        "razorpay_payment_id"
    )

    signature = data.get(
        "razorpay_signature"
    )

    if not all([
        order_id,
        payment_id,
        signature
    ]):

        return jsonify({
            "error":
                "Payment verification data missing."
        }), 400

    conn = get_db()

    subscription = conn.execute(
        """
        SELECT *
        FROM subscriptions
        WHERE razorpay_order_id = ?
        AND user_id = ?
        """,
        (
            order_id,
            user_id
        )
    ).fetchone()

    if not subscription:

        conn.close()

        return jsonify({
            "error":
                "Payment order not found."
        }), 404

    try:

        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

    except Exception as error:

        print(
            "PAYMENT SIGNATURE ERROR:",
            repr(error)
        )

        conn.close()

        return jsonify({
            "error":
                "Payment signature verification failed."
        }), 400

    try:

        payment = (
            razorpay_client
            .payment
            .fetch(payment_id)
        )

    except Exception as error:

        print(
            "PAYMENT FETCH ERROR:",
            repr(error)
        )

        conn.close()

        return jsonify({
            "error":
                "Unable to verify payment status."
        }), 500

    if (
        payment.get("order_id")
        != order_id
    ):

        conn.close()

        return jsonify({
            "error":
                "Payment order mismatch."
        }), 400

    if (
        int(
            payment.get(
                "amount",
                0
            )
        )
        !=
        int(
            subscription["amount"]
        )
    ):

        conn.close()

        return jsonify({
            "error":
                "Payment amount mismatch."
        }), 400

    if (
        payment.get("status")
        not in [
            "authorized",
            "captured"
        ]
    ):

        conn.close()

        return jsonify({
            "error":
                "Payment is not successful."
        }), 400

    starts_at = utc_now()

    ends_at = (
        starts_at
        +
        timedelta(days=365)
    )

    try:

        conn.execute(
            """
            UPDATE subscriptions
            SET razorpay_payment_id = ?,
                status = 'active',
                starts_at = ?,
                ends_at = ?
            WHERE id = ?
            """,
            (
                payment_id,
                starts_at.isoformat(),
                ends_at.isoformat(),
                subscription["id"]
            )
        )

        conn.commit()

    except Exception as error:

        conn.rollback()

        print(
            "SUBSCRIPTION UPDATE ERROR:",
            repr(error)
        )

        return jsonify({
            "error":
                "Unable to activate access."
        }), 500

    finally:

        conn.close()

    return jsonify({
        "success": True,
        "message":
            "Your 1 year access is active.",
        "ends_at":
            ends_at.isoformat()
    })


# ==========================================
# ACCESS STATUS
# ==========================================

@payment_bp.route(
    "/api/access-status"
)
def access_status():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "logged_in": False,
            "active": False,
            "ends_at": None
        })

    conn = get_db()

    subscription = conn.execute(
        """
        SELECT ends_at
        FROM subscriptions
        WHERE user_id = ?
        AND status = 'active'
        AND ends_at > ?
        ORDER BY ends_at DESC
        LIMIT 1
        """,
        (
            user_id,
            utc_now().isoformat()
        )
    ).fetchone()

    conn.close()

    return jsonify({
        "logged_in": True,
        "active":
            subscription is not None,
        "ends_at":
            subscription["ends_at"]
            if subscription
            else None
    })