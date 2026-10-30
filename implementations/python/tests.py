import os
import unittest
from unittest.mock import patch

from app import calculate, create_app, validate_env


class CalculatorTests(unittest.TestCase):
    def test_math_operations(self):
        self.assertEqual(calculate(2, 3, "add"), 5)
        self.assertEqual(calculate(7, 3, "subtract"), 4)
        self.assertEqual(calculate(3, 4, "multiply"), 12)
        self.assertEqual(calculate(12, 4, "divide"), 3)
        self.assertEqual(calculate(2, 3, "power"), 8)

    def test_division_by_zero_and_unknown_operation(self):
        with self.assertRaisesRegex(ValueError, "Division by zero"):
            calculate(1, 0, "divide")
        with self.assertRaisesRegex(ValueError, "Unsupported operation"):
            calculate(1, 2, "modulus")

    def test_configuration_validation(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "API_KEY"):
                validate_env()
        with patch.dict(os.environ, {"API_KEY": "your_secret_here_replace_me"}):
            with self.assertRaisesRegex(RuntimeError, "API_KEY"):
                validate_env()

    def setUp(self):
        self.env = patch.dict(os.environ, {"API_KEY": "test-secret"}, clear=False)
        self.env.start()
        self.client = create_app().test_client()

    def tearDown(self):
        self.env.stop()

    def test_public_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "healthy")

    def test_authentication_and_query_key(self):
        self.assertEqual(self.client.get("/calculate?a=1&b=2").status_code, 401)
        response = self.client.get("/calculate?a=1&b=2&apiKey=test-secret")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], 3)

    def test_get_post_and_bad_inputs(self):
        headers = {"x-api-key": "test-secret"}
        get = self.client.get("/calculate?a=12&b=4&op=multiply", headers=headers)
        self.assertEqual(get.get_json()["result"], 48)
        post = self.client.post("/calculate", json={"a": 10, "b": 2, "operation": "divide"}, headers=headers)
        self.assertEqual(post.get_json()["result"], 5)
        self.assertEqual(self.client.get("/calculate?a=x&b=1", headers=headers).status_code, 400)
        self.assertEqual(self.client.get("/calculate?a=1&b=0&op=divide", headers=headers).status_code, 400)
        self.assertEqual(self.client.get("/calculate?a=1&b=2&op=modulus", headers=headers).status_code, 400)


if __name__ == "__main__":
    unittest.main()
