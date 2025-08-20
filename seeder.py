#!/usr/bin/env python3
import sys
import requests

def run_seeding(base_url: str, secret: str):
    url = f"http://{base_url}/api/seeding"

    headers = {
        "x-seeding-secret": secret
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        print("✅ Seeding successful!")
        try:
            print("Response:", response.json())
        except ValueError:
            print("Response (non-JSON):", response.text)
    except requests.exceptions.RequestException as e:
        print("❌ Seeding failed:", e)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: seeding.py <host:port> <secret>")
        print("Example: seeding.py localhost:3000 my_super_secret")
        sys.exit(1)

    base_url = sys.argv[1]
    secret = sys.argv[2]

    run_seeding(base_url, secret)