import requests

url = "http://localhost:8000/upload"
files = {'file': open('dummy.csv', 'rb')}
response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response:", response.text)
