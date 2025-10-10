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
token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1YTAwNWU5N2NiMWU0MjczMDBlNTJjZGQ1MGYwYjM2Y2Q4MDYyOWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYXBsaWNhY2lvbi13ZWItaW90aWMiLCJhdWQiOiJhcGxpY2FjaW9uLXdlYi1pb3RpYyIsImF1dGhfdGltZSI6MTc2MDA1ODI4MCwidXNlcl9pZCI6IlZSRXVpTDNGVE1hcXlCbGpONFpSNkJhNmdqSTIiLCJzdWIiOiJWUkV1aUwzRlRNYXF5QmxqTjRaUjZCYTZnakkyIiwiaWF0IjoxNzYwMDU4MjgxLCJleHAiOjE3NjAwNjE4ODEsImVtYWlsIjoiZEBjb3JyZW8uY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImRAY29ycmVvLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.HqGIBsRIktgJOSvZcIIAU6zEyXmLSAbIjOS-ToelnjDdwQadkgaX2BnOgPDtxqTxyg_dmz0xTu4jB5O0unqOCzOO6kpRmzHau8rCOHHGDPsROR3clROStrT_TkCQQtTN6Juofp_iT79LYF_1APHMQnFHpilQdaU6kZ47bsjGd8vRbmNmorLVhXW8hTH_dtv1jBnRNM4_uul8tmHGzjcvgBkx0Njc-sYJoGpmMAIgzavI_B7z-Kn4YOh9zio7Ih6jGuPISNip5lwM4sURlsE1KUBfYOsLRHhh1leLsWbpA-JGwBuYzZfkGDk5MgwzL4xMvkhOjOEQDGzYkSR_f4XcTQ"
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
