import requests

def test_feedback():
    url = "http://127.0.0.1:8000/feedback"
    payload = {"user_id": 999, "garment_id": 888, "feedback": 1}
    r = requests.post(url, json=payload)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "success"
    print("Feedback endpoint test passed.")

if __name__ == "__main__":
    test_feedback()
