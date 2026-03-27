from flask import Flask, render_template
import requests
import random

app = Flask(__name__)

url = "https://restcountries.com/v3.1/all"

countries = []

try:
    response = requests.get(url, timeout=10)
    data = response.json() 

    if isinstance(data, list):
        for c in data:
            if isinstance(c, dict):
                name = c.get("name", {}).get("common")
                code = c.get("cca2")

                if name and code:
                    countries.append((name, code.lower()))

except Exception as e:
    print("API ERROR:", e)


@app.route("/")
def home():
    if len(countries) < 2:
        return "❌ Countries not loaded (API problem)"

    c1, c2 = random.sample(countries, 2)

    return render_template("index.html", country1=c1, country2=c2)


if __name__ == "__main__":
    app.run(debug=True)