from flask import Flask, request, jsonify
from solar_logic import solar_recommendation
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/solar", methods=["POST"])
def solar_api():
    try:
        data = request.json

        result = solar_recommendation(
            lat=data["lat"],
            lon=data["lon"],
            roof_area=data["roof_area"],
            monthly_bill=data["monthly_bill"],
            tilt=data.get("tilt", "low_slope"),
            roof_condition=data.get("roof_condition", "good")
        )

        if result is None:
            return jsonify({"error": "Could not generate recommendation. Check your inputs."}), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
