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
token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMjEzMGZlZjAyNTg3ZmQ4ODYxODg2OTgyMjczNGVmNzZhMTExNjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW90aWMtc2VtaWxsZXJvIiwiYXVkIjoiaW90aWMtc2VtaWxsZXJvIiwiYXV0aF90aW1lIjoxNzYwNzYzMzIxLCJ1c2VyX2lkIjoieTY0Q1k5VUxqUlRxRWkyS2hnUU5iUVV2ZGxxMSIsInN1YiI6Ink2NENZOVVMalJUcUVpMktoZ1FOYlFVdmRscTEiLCJpYXQiOjE3NjA3NjMzMjYsImV4cCI6MTc2MDc2NjkyNiwiZW1haWwiOiJhZG1pbjJAcHJ1ZWJhLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJhZG1pbjJAcHJ1ZWJhLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.ECg4aVK_5gvWaog7AZ-PBZrTGGTWXW0IIs4kiQlge2aC9kLthlYQeM_xo3wEyl2XwXv3lhpRMRK_up5szi8LzZGpi9kUAAuzRrLGkOm9wuLgLAbPxJhT8ji7-jKP9o1uwcb_jJe0kv9flY1eJRFZBEDSUP0IZ84sQPGNLJPhHyrkqdSNp04bgmWUqam_fpMkePZPIayOKIMrYJtZgnAy-v-JHRTOtgQlzzz7I1BwpwboJQl0dhdGHdEtmY7tcWnRhlG6_SI4Cb9i4QZrpGXhCweF7NDDY0tEazcQRydhaQi4Leie01ZE1JtuvTBGCcfPERInOo4Efzvwl2s0qHYLXw"
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
