# Python / Flask

Independent Flask implementation of the calculator API. Requires Python 3.10+.

```bash
cd implementations/python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set API_KEY in .env to a non-placeholder secret.
python -m unittest discover -s . -p 'tests.py' -v
python app.py
```

Run with Docker:

```bash
docker build -t calculator-python .
docker run --rm -p 3000:3000 --env-file .env calculator-python
```

API: public `GET /health`; authenticated `GET /calculate?a=12&b=4&op=multiply`; authenticated `POST /calculate` with JSON `{"a":12,"b":4,"operation":"multiply"}`. Use `x-api-key` header or `apiKey` query parameter. Operations: add, subtract, multiply, divide, power. Missing/incorrect credentials return 401; invalid input, unknown operation, and division by zero return 400.
