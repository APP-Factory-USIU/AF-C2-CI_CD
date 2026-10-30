import math
import os
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()
PLACEHOLDER_KEY = "your_secret_here_replace_me"
OPERATIONS = {"add", "subtract", "multiply", "divide", "power"}
STARTED_AT = time.monotonic()


def validate_env():
    key = os.getenv("API_KEY")
    if not key or not key.strip() or key == PLACEHOLDER_KEY:
        raise RuntimeError('FATAL ERROR [CONFIG]: Missing required environment variable "API_KEY".')


def calculate(a, b, operation):
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        if b == 0:
            raise ValueError("Division by zero is not permitted")
        return a / b
    if operation == "power":
        return a ** b
    raise ValueError(f'Unsupported operation: "{operation}"')


def number(value):
    if value is None:
        return math.nan
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, str) and not value.strip():
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return math.nan


def timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def create_app():
    validate_env()
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify(
            status="healthy",
            environment=os.getenv("NODE_ENV", "development"),
            uptimeSeconds=int(time.monotonic() - STARTED_AT),
            timestamp=timestamp(),
        ), 200

    @app.route("/calculate", methods=["GET", "POST"])
    def calculate_endpoint():
        supplied = request.headers.get("x-api-key") or request.args.get("apiKey")
        if supplied != os.getenv("API_KEY"):
            return jsonify(
                error="Unauthorized",
                message="Invalid or missing API key. Provide the x-api-key header or apiKey query parameter.",
            ), 401

        body = request.get_json(silent=True) or {}
        a_raw = body.get("a") if body.get("a") is not None else request.args.get("a")
        b_raw = body.get("b") if body.get("b") is not None else request.args.get("b")
        operation = str(body.get("operation") or request.args.get("op") or "add")
        a, b = number(a_raw), number(b_raw)

        if math.isnan(a) or math.isnan(b):
            return jsonify(error="Bad Request", message='Parameters "a" and "b" must be valid numeric values.'), 400

        try:
            if operation not in OPERATIONS:
                raise ValueError(f'Unsupported operation: "{operation}"')
            result = calculate(a, b, operation)
            if isinstance(result, float) and not math.isfinite(result):
                result = None
            return jsonify(
                a=a if math.isfinite(a) else None,
                b=b if math.isfinite(b) else None,
                operation=operation,
                result=result,
                timestamp=timestamp(),
            ), 200
        except (ValueError, ZeroDivisionError, OverflowError) as error:
            return jsonify(error="Calculation Error", message=str(error) or "Unknown calculation error"), 400

    return app


if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    create_app().run(host="0.0.0.0", port=port)
