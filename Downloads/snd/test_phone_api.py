"""
Quick test script to verify phone usage API endpoints
"""
import requests
import json

print("=" * 60)
print("Testing Phone Usage API Endpoints")
print("=" * 60)

# Test today's usage
print("\n1. Testing /api/phone-usage-today")
print("-" * 60)
try:
    response = requests.get('http://127.0.0.1:5000/api/phone-usage-today')
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"Error: {e}")

# Test weekly usage
print("\n2. Testing /api/phone-usage-weekly")
print("-" * 60)
try:
    response = requests.get('http://127.0.0.1:5000/api/phone-usage-weekly')
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
