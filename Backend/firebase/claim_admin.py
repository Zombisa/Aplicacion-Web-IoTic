# script para generar el rol admin al primer usuario (ejecutar solo este script una vez)
import firebase_admin
from firebase_admin import credentials, auth

# Inicializa si no se ha hecho ya
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

# Token generado desde el front, copiar y pegar aquí para probar
token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1YTAwNWU5N2NiMWU0MjczMDBlNTJjZGQ1MGYwYjM2Y2Q4MDYyOWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW90aWMtc2VtaWxsZXJvIiwiYXVkIjoiaW90aWMtc2VtaWxsZXJvIiwiYXV0aF90aW1lIjoxNzYwMzc1MTIzLCJ1c2VyX2lkIjoiOUV1M0tHTGVhaWhhcnhVSUs5WXpZcWVMVnZsMSIsInN1YiI6IjlFdTNLR0xlYWloYXJ4VUlLOVl6WXFlTFZ2bDEiLCJpYXQiOjE3NjAzNzUxMjMsImV4cCI6MTc2MDM3ODcyMywiZW1haWwiOiJhZG1pbkBwcnVlYmEuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQHBydWViYS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.AZlyK2zV-bO84jnSu7finc2cIrvBU-y8rAER3oY08uYhEzNqarEIpxf2wYyeMOTPkDye1tlerCYGx8tS9gXp9_P_BzIKNJtiGKzssP3X1ZAwuxiHqeUOetUkZdqhVHVTSm9fUc994tvR1mfuQOSavOF-L38mhf2zGelRnq05AHcAppitV6RyDEiVsjsvn4Vm4wPiLw16gI4JVNcR8gSXwhJDUudzCzRXCQpbU1Zg-tFpzBMMaqyq-yo8taxXnEO-symTU7eCmRO1y6KP8Hpra2ijafmno6gAvBN2mrMKbzvAcDgBPv9xj_jpAiWPNUTlnJ7NmRwLP1OuDoiMe7sgYQ"
#verificar el token
try:
    decoded_token = auth.verify_id_token(token)
    uid = decoded_token['uid']
    print("Token válido")
    print("Usuario autenticado:", decoded_token['uid'])
    print("Email:", decoded_token.get('email'))

    # Crear el custom claim para asignar rol de admin (asignación manual)
    # Asigna el custom claim al usuario. Este claim se 
    # guardará en Firebase Authentication y se incluirá en 
    # los futuros ID tokens del usuario cuando vuelva a autenticarse.
    auth.set_custom_user_claims(uid, {'role': 'admin'})
    print("Rol 'admin' asignado correctamente al usuario.")

except Exception as e:
    print("Token inválido o expirado:", e)
