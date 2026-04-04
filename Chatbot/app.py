from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import get_response

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        reply = get_response(user_message)

        return jsonify({
            "success": True,
            "reply": reply
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/")
def home():
    return "API is running 🚀"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)